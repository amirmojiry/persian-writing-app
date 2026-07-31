import { expect, test } from '@playwright/test';

test('web client opens', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'نام‌نویس فارسی' })).toBeVisible();
  await expect(page.getByText('زیرساخت برنامه آماده است')).toBeVisible();
});
