import { expect, test, type Page } from '@playwright/test';

const ROUTES = [
  'accueil',
  'themes',
  'theme/principes_valeurs',
  'lecon/principes_valeurs',
  'revision',
  'situations',
  'progression',
  'parametres',
  'examen',
  'sources',
];

async function onboard(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Commencer', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

/** Textes visibles dont le contraste avec le fond effectif est sous le seuil AA. */
async function lowContrast(page: Page) {
  return page.evaluate(() => {
    const parse = (color: string) => {
      const v = color.match(/[\d.]+/g)!.map(Number);
      return { r: v[0]!, g: v[1]!, b: v[2]!, a: v[3] ?? 1 };
    };
    const lum = ({ r, g, b }: { r: number; g: number; b: number }) => {
      const [R, G, B] = [r, g, b].map((c) => {
        const x = c / 255;
        return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      });
      return R! * 0.2126 + G! * 0.7152 + B! * 0.0722;
    };
    const over = (top: ReturnType<typeof parse>, bottom: ReturnType<typeof parse>) => ({
      r: top.r * top.a + bottom.r * (1 - top.a),
      g: top.g * top.a + bottom.g * (1 - top.a),
      b: top.b * top.a + bottom.b * (1 - top.a),
      a: 1,
    });
    const background = (element: Element): ReturnType<typeof parse> | null => {
      const layers: ReturnType<typeof parse>[] = [];
      for (let node: Element | null = element; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.backgroundImage !== 'none') return null;
        const color = parse(style.backgroundColor);
        if (color.a > 0) layers.push(color);
        if (color.a === 1) break;
      }
      return layers.reduceRight((below, layer) => over(layer, below), {
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });
    };
    const found: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const element = node.parentElement;
      if (!element || !node.textContent?.trim()) continue;
      const style = getComputedStyle(element);
      if (
        style.visibility === 'hidden' ||
        style.display === 'none' ||
        element.closest('.sr-only, [aria-hidden="true"]')
      )
        continue;
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const bg = background(element);
      if (!bg) continue;
      const fg = over(parse(style.color), bg);
      const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
      const ratio = (hi! + 0.05) / (lo! + 0.05);
      const size = parseFloat(style.fontSize);
      const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
      if (ratio < (large ? 3 : 4.5))
        found.push(
          `${element.tagName.toLowerCase()}.${element.className} « ${node.textContent.trim().slice(0, 30)} » ${ratio.toFixed(2)}`,
        );
    }
    return found;
  });
}

test('le réglage Apparence force le thème et persiste après rechargement', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await onboard(page);
  const pageBackground = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
  await page.goto('/#/parametres');
  expect(await pageBackground()).toBe('rgb(247, 248, 252)');
  await page.getByLabel('Sombre').check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await pageBackground()).toBe('rgb(13, 20, 36)');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByLabel('Automatique').check();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  expect(await pageBackground()).toBe('rgb(247, 248, 252)');
});

for (const scheme of ['light', 'dark'] as const) {
  test(`contraste AA du texte, thème ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await onboard(page);
    const problems: string[] = [];
    for (const route of ROUTES) {
      await page.goto(`/#/${route}`);
      await expect(page.locator('main h1').first()).toBeVisible();
      for (const entry of await lowContrast(page)) problems.push(`${route}: ${entry}`);
    }
    expect(problems).toEqual([]);
  });
}
