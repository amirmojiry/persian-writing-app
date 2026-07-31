import { expect, test, type Page } from '@playwright/test';

async function drawStroke(page: Page, offset = 0): Promise<void> {
  const canvas = page.getByTestId('writing-surface');
  const box = await canvas.boundingBox();
  if (box === null) {
    throw new Error('Writing canvas is not visible.');
  }
  await page.mouse.move(box.x + 70 + offset, box.y + 80);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 80, box.y + box.height - 90 - offset, { steps: 8 });
  await page.mouse.up();
}

async function openPractice(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('wizard-check').click();
  await page.getByTestId('name-input').fill('لی');
  await page.getByTestId('confirm-name').click();
  await page.getByTestId('timed-mode').check();
  await page.getByTestId('time-limit').evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = '120';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.getByTestId('start-practice').click();
  await expect(page.getByTestId('practice-step')).toBeVisible();
}

test('timed tools, replay, exports and share fallback work in the browser', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: undefined });
  });
  await openPractice(page);

  await expect(page.getByTestId('timer-panel')).toBeVisible();
  await drawStroke(page);
  await drawStroke(page, 20);
  await expect(page.locator('.child-stroke')).toHaveCount(2);

  await page.getByTestId('undo-stroke').click();
  await expect(page.locator('.child-stroke')).toHaveCount(1);
  await page.getByTestId('clear-letter').click();
  await expect(page.locator('.child-stroke')).toHaveCount(0);
  await page.getByTestId('retry-letter').click();
  await expect(page.getByTestId('timer-seconds')).toHaveText('120');

  await drawStroke(page);
  await page.getByTestId('next-letter').click();
  await expect(page.getByText('حرف 2 / 2')).toBeVisible();
  await drawStroke(page);
  await page.getByTestId('next-letter').click();
  await expect(page.getByTestId('result-step')).toBeVisible();

  await page.getByTestId('replay-result').click();
  await expect(page.getByTestId('stroke-replay')).toBeVisible();

  const svgDownload = page.waitForEvent('download');
  await page.getByTestId('download-svg').click();
  expect((await svgDownload).suggestedFilename()).toBe('لی-writing.svg');

  const pngDownload = page.waitForEvent('download');
  await page.getByTestId('download-png').click();
  expect((await pngDownload).suggestedFilename()).toBe('لی-writing.png');

  const pdfDownload = page.waitForEvent('download');
  await page.getByTestId('download-pdf').click();
  expect((await pdfDownload).suggestedFilename()).toBe('لی-writing.pdf');

  const fallbackDownload = page.waitForEvent('download');
  await page.getByTestId('share-result').click();
  expect((await fallbackDownload).suggestedFilename()).toBe('لی-writing.png');
  await expect(page.getByText('اشتراک‌گذاری پشتیبانی نشد؛ تصویر دانلود شد.')).toBeVisible();
});
