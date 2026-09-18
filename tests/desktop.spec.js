const { test, expect } = require('@playwright/test');

async function boot(page) {
  await page.goto('./?e2e=1', { waitUntil: 'networkidle' });
  await expect(page.locator('#home')).toHaveClass(/active/);
  await expect(page.locator('.hero h1')).toContainText('Найди своё направление');
}
async function expectImageLoaded(locator) {
  await expect(locator).toBeVisible();
  expect(await locator.evaluate(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0)).toBeTruthy();
}

test('главная сохраняет ключевые блоки', async ({ page }) => {
  await boot(page);
  await expectImageLoaded(page.locator('.hero-image img'));
  await expect(page.locator('.profile-summary')).toBeVisible();
  await expect(page.locator('#homeRadar')).toBeVisible();
  await expect(page.locator('#homeTop .mini-rank')).toHaveCount(6);
  await expect(page.locator('#eventsList .event-item')).toHaveCount(3);
  await expect(page.locator('.rightbar')).toBeVisible();
});

test('основная навигация переключает разделы', async ({ page }) => {
  await boot(page);
  for (const id of ['diagnostics','results','recommendations','atlas','programs','trajectory','prep','dpo','market','profile','help']) {
    await page.locator('#nav button[data-view="'+id+'"]').click();
    await expect(page.locator('#'+id)).toHaveClass(/active/);
    await expect(page.locator('#'+id)).toBeVisible();
  }
});

test('диагностика открывается и запускает быстрый режим', async ({ page }) => {
  await boot(page);
  await page.locator('#nav button[data-view="diagnostics"]').click();
  await expect(page.locator('.diagnostic-mode-card')).toHaveCount(2);
  await page.locator('.diagnostic-mode-card.quick').click();
  await expect(page.locator('#diagnosticWizardWrap')).toBeVisible();
  await expect(page.locator('#wizardBody .question').first()).toBeVisible();
  await expect(page.locator('#nextBtn')).toBeVisible();
});

test('TOP-10, Атлас и траектория рендерятся', async ({ page }) => {
  await boot(page);
  await page.locator('#nav button[data-view="recommendations"]').click();
  await expect(page.locator('#recommendationsFull .full-rank')).toHaveCount(10);
  await page.locator('#nav button[data-view="atlas"]').click();
  await expect(page.locator('#atlasCategories .atlas-category').first()).toBeVisible();
  await expect(page.locator('#atlasGrid .atlas-card').first()).toBeVisible();
  await page.locator('#nav button[data-view="trajectory"]').click();
  await expect(page.locator('#trajectoryMap .trajectory-banner')).toBeVisible();
  await expect(page.locator('#trajectoryMap .career-lane')).toHaveCount(3);
});

test('кнопка «Как это работает?» открывает методику', async ({ page }) => {
  await boot(page);
  await page.getByRole('button', { name: 'Как это работает?' }).click();
  await expect(page.locator('#method')).toHaveClass(/active/);
  await expect(page.locator('#method .method-card')).toBeVisible();
});
