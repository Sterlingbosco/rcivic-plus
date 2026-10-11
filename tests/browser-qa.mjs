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
  return { after, layouts, zoom, captures: ['.devin/qa/desktop.png', '.devin/qa/mobile.png'] };
}
