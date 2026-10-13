import { test, expect, type Page } from '@playwright/test';
import { questions, questionsForTheme } from '../src/data/content';
import { createProgress } from '../src/domain/progress';
import { startQuiz } from '../src/domain/quiz';
import type { Progress } from '../src/domain/schema';

async function storedProgress(page: Page): Promise<Progress> {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open('civic-plus', 1);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('progress', 'readonly');
          const read = tx.objectStore('progress').get('current');
          read.onsuccess = () => {
            db.close();
            resolve(read.result);
          };
          read.onerror = () => reject(new Error('Lecture du test impossible.'));
        };
      }),
  );
}
async function seed(page: Page, progress: unknown) {
  await page.evaluate(
    (value) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('civic-plus', 1);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('progress', 'readwrite');
          tx.objectStore('progress').put(value, 'current');
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onabort = () => reject(new Error('Écriture du test impossible.'));
        };
      }),
    progress,
  );
  await page.reload();
}
async function welcome(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Commencer', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bonjour, prêt à avancer ?');
}
async function answerCurrent(page: Page, correct: boolean) {
  const heading = await page.getByRole('heading', { level: 1 }).innerText();
  const original = questions.find((question) => question.question === heading)!;
  const text =
    original.answers[correct ? original.correctAnswer : (original.correctAnswer + 1) % 4]!;
  await page
    .getByRole('radio', { name: new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })
    .check();
  await page.getByRole('button', { name: 'Valider ma réponse' }).click();
}

test('parcours complet : accueil, thème, apprentissage, erreur, XP, résultat et révision persistés', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const count = questionsForTheme('principes_valeurs').length;
  const lessonXp = count * 30;
  const trainingXp = lessonXp + (count - 1) * 10;
  await page.setViewportSize({ width: 390, height: 844 });
  await welcome(page);
  await page.locator('a[href="#/theme/principes_valeurs"]').first().click();
  await page.getByRole('button', { name: 'Apprendre cette unité' }).click();
  for (let index = 0; index < count; index++) {
    await expect(page.getByRole('button', { name: 'J’ai compris', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'J’ai compris', exact: true }).click();
    await expect(page.getByRole('button', { name: 'J’ai compris', exact: true })).toHaveCount(
      index === count - 1 ? 0 : 1,
    );
  }
  await expect(page.getByRole('heading', { name: 'Place à la pratique.' })).toBeVisible();
  expect((await storedProgress(page)).xp).toBe(lessonXp);
  await page.getByRole('button', { name: 'Commencer le quiz' }).click();
  const sessionId = (await storedProgress(page)).activeSession!.id;
  await expect(page.getByRole('button', { name: 'Valider ma réponse' })).toBeDisabled();
  const wrongQuestion = (await storedProgress(page)).activeSession!.questions[0]!.id;
  for (let index = 0; index < count; index++) {
    await answerCurrent(page, index !== 0);
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: index === 0 ? 'Pas encore. Voici l’explication.' : 'Bien compris.',
      }),
    ).toBeVisible();
    await expect(page.locator('#answer-feedback')).toBeFocused();
    if (index === 0) {
      const saved = await storedProgress(page);
      expect(saved.xp).toBe(lessonXp);
      expect(saved.questionStats[wrongQuestion]?.incorrect).toBe(1);
      await page.reload();
      await expect(
        page.getByRole('heading', { name: 'Pas encore. Voici l’explication.' }),
      ).toBeVisible();
      expect((await storedProgress(page)).activeSession!.id).toBe(sessionId);
    }
    await page
      .getByRole('button', {
        name: index === count - 1 ? 'Voir mon résultat' : 'Question suivante',
      })
      .click();
  }
  await expect(page.locator('.result-score')).toHaveText(`${count - 1} / ${count}`);
  const result = await storedProgress(page);
  expect(result.xp).toBe(trainingXp);
  expect(result.history).toHaveLength(1);
  await page.getByRole('link', { name: 'Revoir mes erreurs', exact: true }).click();
  await page.getByRole('button', { name: 'Commencer la révision' }).click();
  expect((await storedProgress(page)).activeSession!.questions[0]?.id).toBe(wrongQuestion);
  await answerCurrent(page, true);
  await page.getByRole('button', { name: 'Voir mon résultat' }).click();
  expect((await storedProgress(page)).xp).toBe(trainingXp + 25);
  await page.goto('/#/progression');
  await expect(page.getByRole('heading', { name: 'Premier pas', exact: true })).toBeVisible();
  await page.goto('/#/examen');
  await expect(page.getByRole('button', { name: 'Démarrer mon examen blanc' })).toBeEnabled();
  await expect(
    page.getByText('Un examen blanc d’entraînement, sur un corpus encore limité.'),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

for (const width of [320, 390, 768, 1440]) {
  test(`responsive, navigation et cibles tactiles à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await welcome(page);
    const routes = [
      'accueil',
      'themes',
      'theme/principes_valeurs',
      'lecon/principes_valeurs',
      'revision',
      'erreurs',
      'situations',
      'progression',
      'parametres',
      'sources',
      'examen',
    ];
    for (const route of routes) {
      await page.goto(`/#/${route}`);
      await expect(page.locator('main h1')).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflow, route).toBe(false);
      for (const button of await page.getByRole('button').all()) {
        const box = await button.boundingBox();
        if (box) expect(box.height, await button.innerText()).toBeGreaterThanOrEqual(44);
      }
    }
    await page.goto('/#/accueil');
    await page.screenshot({ path: `test-results/accueil-${width}.png`, fullPage: true });
  });
}

test('clavier, radios et réduction des animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await welcome(page);
  await page.getByRole('link', { name: 'Apprendre', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Une notion à la fois.' })).toBeFocused();
  await page.goto('/#/theme/institutions');
  await page.getByRole('button', { name: 'M’entraîner directement' }).click();
  const radios = page.getByRole('radio');
  await radios.first().focus();
  await page.keyboard.press('Space');
  await expect(radios.first()).toBeChecked();
  await page.keyboard.press('ArrowDown');
  await expect(radios.nth(1)).toBeChecked();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Valider ma réponse' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#answer-feedback')).toBeFocused();
  const transition = await page
    .locator('.button-primary')
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(transition).toBe('0s');
});

test('le corpus enrichi conserve une progression et une session de l’ancien lot', async ({
  page,
}) => {
  await welcome(page);
  const previous = {
    ...createProgress(),
    xp: 420,
    understood: questions.slice(0, 14).map((question) => question.id),
    preferences: { ...createProgress().preferences, onboarded: true },
    activeSession: startQuiz(questions.slice(0, 6), 'training'),
  };
  await seed(page, previous);
  await page.goto('/#/accueil');
  await expect(page.locator('.theme-card').first()).toContainText('6/37 notions comprises');
  expect((await storedProgress(page)).xp).toBe(420);
  await page.getByRole('button', { name: 'Reprendre ma session' }).click();
  await expect(page.getByText('QUESTION 1 / 6', { exact: true })).toBeVisible();
  expect((await storedProgress(page)).activeSession!.id).toBe(previous.activeSession.id);
});

test('examen public : 28 connaissances, 12 exercices, reprise, score 32/40 et corrections finales', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 900 });
  await welcome(page);
  await page.goto('/#/examen');
  await page.getByRole('button', { name: 'Démarrer mon examen blanc' }).click();
  await expect(page.getByText('QUESTION 1 / 40', { exact: true })).toBeVisible();
  const initial = (await storedProgress(page)).activeSession!;
  expect(initial.questions).toHaveLength(40);
  expect(new Set(initial.questions.map((question) => question.id)).size).toBe(40);
  expect(
    initial.questions.filter((question) => question.type === 'QUESTION_OFFICIELLE'),
  ).toHaveLength(28);
  expect(
    initial.questions.filter((question) => question.type === 'EXERCICE_ENTRAINEMENT'),
  ).toHaveLength(12);
  expect(Date.parse(initial.deadline!) - Date.parse(initial.startedAt)).toBe(45 * 60000);
  for (let index = 0; index < 40; index++) {
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `question ${index + 1}`,
    ).toBeLessThanOrEqual(320);
    await answerCurrent(page, index < 32);
    if (index < 39) {
      await expect(page.getByText(`QUESTION ${index + 2} / 40`, { exact: true })).toBeVisible();
      await expect(page.locator('#answer-feedback')).toHaveCount(0);
      const saved = await storedProgress(page);
      expect(saved.xp).toBe(0);
      expect(Object.keys(saved.questionStats)).toHaveLength(0);
      if (index === 11) {
        await page.reload();
        await expect(page.getByText('QUESTION 13 / 40', { exact: true })).toBeVisible();
        expect((await storedProgress(page)).activeSession!.deadline).toBe(initial.deadline);
      }
    }
  }
  await expect(page.locator('.result-score')).toHaveText('32 / 40');
  await expect(page.getByText('Objectif pédagogique 32/40 atteint', { exact: true })).toBeVisible();
  const result = await storedProgress(page);
  expect(result.xp).toBe(100);
  expect(result.history[0]?.score).toBe(32);
  expect(result.earnedBadges).toContain('target-32');
  expect(Object.keys(result.questionStats)).toHaveLength(40);
  await page.getByText('Comprendre mes 8 réponses à consolider', { exact: true }).click();
  await expect(page.locator('details .review-item')).toHaveCount(8);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    'résultat détaillé',
  ).toBeLessThanOrEqual(320);
  expect(await page.getByRole('link', { name: /^Reprendre :/ }).count()).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('examen synthétique complet : 40 réponses, aucun feedback ou XP avant la fin', async ({
  page,
}) => {
  await welcome(page);
  const base = questions[0]!;
  const synthetic = Array.from({ length: 40 }, (_, index) => ({
    ...base,
    id: `TEST-EXAM-${index}`,
  }));
  const session = startQuiz(synthetic, 'exam');
  const progress = {
    ...createProgress(),
    preferences: { ...createProgress().preferences, onboarded: true },
    activeSession: session,
  };
  await seed(page, progress);
  await page.goto('/#/quiz');
  for (let index = 0; index < 40; index++) {
    await page.getByRole('radio', { name: /La Marseillaise/ }).check();
    await page.getByRole('button', { name: 'Valider ma réponse' }).click();
    if (index < 39) {
      await expect(page.getByText(`QUESTION ${index + 2} / 40`, { exact: true })).toBeVisible();
      await expect(page.locator('#answer-feedback')).toHaveCount(0);
      expect((await storedProgress(page)).xp).toBe(0);
    }
  }
  await expect(page.locator('.result-score')).toHaveText('40 / 40');
  expect((await storedProgress(page)).xp).toBe(100);
});

test('échéance d’examen persistée et sauvegarde corrompue conservée', async ({ page }) => {
  await welcome(page);
  const progress = await storedProgress(page);
  const session = startQuiz([questions[0]!], 'exam', new Date(Date.now() - 46 * 60000));
  await seed(page, { ...progress, activeSession: session });
  await page.goto('/#/quiz');
  await expect(page.locator('.result-score')).toHaveText('0 / 1');
  await expect(
    page.getByRole('link', { name: 'Apprendre les notions non répondues' }),
  ).toBeVisible();
  expect(Object.keys((await storedProgress(page)).questionStats)).toHaveLength(0);
  await seed(page, { ...progress, xp: -1 });
  await expect(
    page.getByText('La sauvegarde ne peut pas être lue.', { exact: false }),
  ).toBeVisible();
  expect((await storedProgress(page)).xp).toBe(-1);
});

test('échec de sauvegarde visible puis reprise sans perte ni double XP', async ({ page }) => {
  await welcome(page);
  await page.goto('/#/lecon/principes_valeurs');
  await expect(page.getByRole('button', { name: 'J’ai compris', exact: true })).toBeVisible();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function () {
      IDBObjectStore.prototype.put = original;
      throw new DOMException('Quota de stockage atteint', 'QuotaExceededError');
    };
  });
  await page.getByRole('button', { name: 'J’ai compris', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('ne sont pas sauvegardés');
  expect((await storedProgress(page)).xp).toBe(0);
  await page.getByRole('button', { name: 'Réessayer la sauvegarde' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect((await storedProgress(page)).xp).toBe(30);
});

test('reflow avec un texte agrandi à 200 %', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await welcome(page);
  for (const route of [
    'accueil',
    'themes',
    'theme/principes_valeurs',
    'lecon/principes_valeurs',
    'revision',
    'situations',
    'progression',
    'parametres',
    'sources',
    'examen',
  ]) {
    await page.goto(`/#/${route}`);
    await expect(page.locator('main h1')).toBeVisible();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, route).toBeLessThanOrEqual(390);
  }
});

test('contraste AA des contrôles principaux et des étiquettes', async ({ page }) => {
  await welcome(page);
  for (const selector of ['.button-primary', '.tag-blue', '.xp-pill']) {
    const ratio = await page
      .locator(selector)
      .first()
      .evaluate((element) => {
        const style = getComputedStyle(element);
        const luminance = (color: string) => {
          const values = color
            .match(/[\d.]+/g)!
            .slice(0, 3)
            .map((value) => {
              const channel = Number(value) / 255;
              return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
            });
          return values[0]! * 0.2126 + values[1]! * 0.7152 + values[2]! * 0.0722;
        };
        const foreground = luminance(style.color);
        const background = luminance(style.backgroundColor);
        return (
          (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)
        );
      });
    expect(ratio, selector).toBeGreaterThanOrEqual(4.5);
  }
});

test('PWA : manifest, icônes et reprise hors connexion après chargement initial', async ({
  page,
  context,
}) => {
  await welcome(page);
  await expect(page).toHaveTitle('RCIVIC+ — Votre préparation civique');
  const manifest = (await (await page.request.get('/manifest.webmanifest')).json()) as {
    name: string;
    short_name: string;
    id: string;
    display: string;
    icons: { src: string }[];
  };
  expect(manifest.name).toBe('RCIVIC+ — Préparation civique CSP');
  expect(manifest.short_name).toBe('RCIVIC+');
  expect(manifest.id).toBe('./');
  expect(manifest.display).toBe('standalone');
  for (const icon of manifest.icons) {
    const response = await page.request.get(`/${icon.src}`);
    expect(response.headers()['content-type']).toContain('image/png');
    expect((await response.body()).subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  }
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Bonjour, prêt à avancer ?' })).toBeVisible();
  await page.goto('/#/theme/principes_valeurs');
  await page.getByRole('button', { name: 'Apprendre cette unité' }).click();
  await expect(
    page.getByRole('heading', { name: "Quel est le nom de l'hymne national ?" }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'J’ai compris', exact: true }).click();
  expect((await storedProgress(page)).xp).toBe(30);
  await context.setOffline(false);
});
