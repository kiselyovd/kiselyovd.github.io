import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const targets = [
  ['portfolio', '/'],
  ['template', '/showcase/ml-project-template/'],
  ['dungeon', '/showcase/dungeon-master-ai/'],
  ['vehicle-viewer', 'https://kiselyovd.github.io/vehicle-keypoints/showcase/'],
  ['capture-explorer', 'https://kiselyovd.github.io/ue5-vehicle-synth/showcase/'],
  ['chest-explorer', 'https://kiselyovd.github.io/chest-xray-classifier/showcase/'],
  ['grnti-explorer', 'https://kiselyovd.github.io/grnti-text-classifier/showcase/'],
  ['grnti-space', 'https://kiselyovd-grnti-text-classifier-demo.hf.space/'],
  ['vehicle-space', 'https://kiselyovd-vehicle-keypoints-demo.hf.space/'],
];

for (const [name, url] of targets) {
  test(`${name}: accessible production root and reflow`, async ({ page }, testInfo) => {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      content: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    }));
    expect(dimensions.viewport).toBe(testInfo.project.use.viewport.width);
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
    if (testInfo.project.name === 'mobile-dark-reduced') expect(dimensions.reducedMotion).toBe(true);
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement.tagName)).not.toBe('BODY');
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    await testInfo.attach('viewport-and-axe', {
      body: JSON.stringify({ name, url: page.url(), dimensions, violations: result.violations,
        incomplete: result.incomplete.map((item) => ({ id: item.id, impact: item.impact })) }, null, 2),
      contentType: 'application/json',
    });
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
    expect(result.violations).toEqual([]);
  });
}

test('portfolio language and keyboard preserve generated evidence', async ({ page }) => {
  await page.goto('/');
  const mobile = page.viewportSize().width < 768;
  if (mobile) {
    await page.getByRole('button', { name: 'Open menu', exact: true }).press('Enter');
    await expect(page.getByRole('button', { name: 'Close menu', exact: true })).toBeFocused();
  }
  await page.getByRole('button', { name: 'EN · RU — Switch language', exact: true }).press('Enter');
  if (mobile) await page.getByRole('button', { name: 'Close menu', exact: true }).press('Enter');
  await expect(page.getByRole('heading', { name: 'Модели и оценка', exact: true })).toBeVisible();
  const score = page.getByRole('link', { name: 'Dice 88.08%. Evaluation report for brain-mri-segmentation', exact: true });
  await expect(score).toHaveAttribute('href', /\/blob\/[a-f0-9]{40}\/reports\//);
  await score.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('href', 'https://huggingface.co/kiselyovd/brain-mri-segmentation');
  await expect(page.getByRole('link', { name: 'Запустить', exact: true }).filter({ hasText: 'Запустить' })).toHaveCount(2);
});
