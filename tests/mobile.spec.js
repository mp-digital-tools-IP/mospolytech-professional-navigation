const { test, expect } = require('@playwright/test');

async function boot(page) {
  await page.goto('/?e2e=1', { waitUntil: 'networkidle' });
  await expect(page.locator('#home')).toHaveClass(/active/);
  await expect(page.locator('.hero h1')).toContainText('Найди своё направление');
}
async function expectImageLoaded(locator) {
  await expect(locator).toBeVisible();
  expect(await locator.evaluate(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0)).toBeTruthy();
}

test('главная мобильной версии не теряет контент', async ({ page }) => {
  await boot(page);
  await expect(page.locator('.mobile-bottom-nav')).toBeVisible();
  await expectImageLoaded(page.locator('.hero-image img'));
  await expect(page.locator('.profile-summary')).toBeVisible();
  await expect(page.locator('#eventsList .event-item')).toHaveCount(3);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});

test('нижняя мобильная навигация работает', async ({ page }) => {
  await boot(page);
  for (const id of ['diagnostics','recommendations','atlas','trajectory','home']) {
    const button = page.locator('.mobile-bottom-nav button[data-mobile-view="'+id+'"]');
    await button.click();
    await expect(page.locator('#'+id)).toHaveClass(/active/);
    await expect(page.locator('#'+id)).toBeVisible();
  }
});

test('drawer открывается, профиль и события доступны', async ({ page }) => {
  await boot(page);
  await page.locator('.mobile-menu-toggle').click();
  await expect(page.locator('body')).toHaveClass(/nav-open/);
  await page.locator('#nav button[data-view="profile"]').click();
  await expect(page.locator('#profile')).toHaveClass(/active/);
  await expect(page.locator('body')).not.toHaveClass(/nav-open/);
  await page.locator('.mobile-bottom-nav button[data-mobile-view="home"]').click();
  await expect(page.locator('#eventsList .event-item').first()).toBeVisible();
});

test('диагностика на телефоне запускается и кнопки доступны', async ({ page }) => {
  await boot(page);
  await page.locator('.mobile-bottom-nav button[data-mobile-view="diagnostics"]').click();
  await expect(page.locator('.diagnostic-mode-card.quick')).toBeVisible();
  await page.locator('.diagnostic-mode-card.quick').click();
  await expect(page.locator('#diagnosticWizardWrap')).toBeVisible();
  await expect(page.locator('#backBtn')).toBeVisible();
  await expect(page.locator('#nextBtn')).toBeVisible();
  const box = await page.locator('#nextBtn').boundingBox();
  expect(box.width).toBeGreaterThan(80);
  expect(box.height).toBeGreaterThan(38);
});

test('TOP-10, Атлас и траектория доступны с телефона', async ({ page }) => {
  await boot(page);
  await page.locator('.mobile-bottom-nav button[data-mobile-view="recommendations"]').click();
  await expect(page.locator('#recommendationsFull .full-rank')).toHaveCount(10);
  await page.locator('.mobile-bottom-nav button[data-mobile-view="atlas"]').click();
  await expect(page.locator('#atlasCategories .atlas-category').first()).toBeVisible();
  await page.locator('.mobile-bottom-nav button[data-mobile-view="trajectory"]').click();
  await expect(page.locator('#trajectoryMap .career-lane')).toHaveCount(3);
});
