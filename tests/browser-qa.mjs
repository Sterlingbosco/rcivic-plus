export default async function inspect(page, ui) {
  const before = await ui.snapshot();
  const start = before.match(/@(e\d+) button "Commencer"/)?.[1];
  if (!start) throw new Error(`Bouton d’accueil absent : ${before}`);
  await ui.click(start);
  await page.getByRole('heading', { name: 'Bonjour, prêt à avancer ?' }).waitFor();
  const after = await ui.snapshot({ full: true });
  const layouts = [];
  for (const [name, width] of [
    ['desktop', 1440],
    ['mobile', 390],
  ]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({ path: `.devin/qa/${name}.png`, fullPage: true });
    layouts.push(
      await page.evaluate(
        (viewport) => ({
          viewport,
          documentWidth: document.documentElement.scrollWidth,
          heading: document.querySelector('h1')?.textContent,
          themeCards: document.querySelectorAll('.theme-card').length,
          font: getComputedStyle(document.body).fontFamily,
        }),
        width,
      ),
    );
  }
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  const zoom = await page.evaluate(() => ({
    width: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    textOverflow: [...document.querySelectorAll('main p, main h2, main h3')]
      .map((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return { text: element.textContent, right: range.getBoundingClientRect().right };
      })
      .filter((entry) => entry.right > window.innerWidth),
    overflow: [...document.querySelectorAll('main *, header *')]
      .filter((element) => element.getBoundingClientRect().right > window.innerWidth)
      .slice(0, 15)
      .map((element) => ({
        tag: element.tagName,
        className: element.className,
        width: element.getBoundingClientRect().width,
        right: element.getBoundingClientRect().right,
      })),
  }));
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '';
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('link', { name: /L’objectif : 32/ }).click();
  await page.getByRole('button', { name: 'Démarrer mon examen blanc' }).waitFor();
  await ui.snapshot();
  await page.screenshot({ path: '.devin/qa/exam.png', fullPage: true });
  await page.getByRole('button', { name: 'Démarrer mon examen blanc' }).click();
  await page.getByRole('button', { name: 'Valider ma réponse' }).waitFor();
  await page.setViewportSize({ width: 320, height: 900 });
  await page.screenshot({ path: '.devin/qa/question.png', fullPage: true });
  const exam = {
    snapshot: await ui.snapshot({ full: true }),
    width: await page.evaluate(() => document.documentElement.scrollWidth),
  };
  return {
    after,
    layouts,
    zoom,
    exam,
    captures: [
      '.devin/qa/desktop.png',
      '.devin/qa/mobile.png',
      '.devin/qa/exam.png',
      '.devin/qa/question.png',
    ],
  };
}
