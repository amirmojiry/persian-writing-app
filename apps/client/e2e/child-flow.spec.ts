import { expect, test } from '@playwright/test';

async function enterName(page: import('@playwright/test').Page, name: string) {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.getByTestId('wizard-check').click();
  await page.getByTestId('name-input').fill(name);
  await page.getByTestId('confirm-name').click();
  await expect(page.getByTestId('ready-step')).toBeVisible();
  await page.getByTestId('start-practice').click();

  try {
    await expect(page.getByTestId('practice-step')).toBeVisible({ timeout: 8_000 });
  } catch {
    const pageText = await page.locator('body').innerText();
    throw new Error(`Practice did not open. Runtime errors: ${runtimeErrors.join(' | ') || 'none'}. Page: ${pageText}`);
  }
}

async function drawStroke(page: import('@playwright/test').Page) {
  const canvas = page.getByTestId('writing-surface');
  const box = await canvas.boundingBox();
  if (box === null) {
    throw new Error('Writing canvas is not visible.');
  }
  await page.mouse.move(box.x + 60, box.y + 70);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 70, box.y + box.height - 80, { steps: 8 });
  await page.mouse.up();
}

test('child completes a Persian name entirely in the browser', async ({ page }) => {
  await page.goto('/');
  await enterName(page, 'لیا');

  for (let index = 0; index < 3; index += 1) {
    await drawStroke(page);
    await page.getByTestId('next-letter').click();
  }

  await expect(page.getByTestId('result-step')).toBeVisible();
  await expect(page.getByTestId('composition-svg').getByRole('img')).toHaveAttribute('alt', 'لیا');
});

test('refresh resumes an active IndexedDB session and its current letter', async ({ page }) => {
  await page.goto('/');
  await enterName(page, 'لی');
  await drawStroke(page);
  await page.getByTestId('next-letter').click();
  await expect(page.getByText('حرف 2 / 2')).toBeVisible();

  await page.reload();

  await expect(page.getByTestId('practice-step')).toBeVisible();
  await expect(page.getByText('تمرین قبلی‌ات از همان‌جا ادامه پیدا کرد.')).toBeVisible();
  await expect(page.getByText('حرف 2 / 2')).toBeVisible();
});
