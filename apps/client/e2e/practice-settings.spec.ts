import { expect, test } from '@playwright/test';

test('adult practice settings apply and survive a refresh', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('wizard-check').click();
  await page.getByTestId('name-input').fill('لیا');
  await page.getByTestId('confirm-name').click();

  await expect(page.getByTestId('practice-settings')).toBeVisible();
  await page.getByTestId('mode-reference').click();
  await page.getByTestId('guideline-style').selectOption('grid');
  await page.getByTestId('sample-font').selectOption('system-serif');
  await page.getByTestId('guideline-opacity').fill('70');
  await page.getByTestId('guideline-thickness').fill('6');
  await page.getByTestId('baseline-position').fill('80');
  await page.getByTestId('start-practice').click();

  await expect(page.getByTestId('reference-sample')).toHaveText('لـ');
  await expect(page.getByTestId('trace-reference')).toHaveCount(0);
  await expect(page.getByTestId('writing-surface')).toHaveAttribute('data-practice-mode', 'reference');
  await expect(page.getByTestId('guideline-layer')).toHaveAttribute('data-guide-style', 'grid');
  expect(await page.locator('.guide-line').count()).toBeGreaterThan(10);

  await page.reload();

  await expect(page.getByTestId('practice-step')).toBeVisible();
  await expect(page.getByTestId('reference-sample')).toHaveText('لـ');
  await expect(page.getByTestId('guideline-layer')).toHaveAttribute('data-guide-style', 'grid');
});
