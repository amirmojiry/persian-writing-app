import { expect, test, type Page } from '@playwright/test';

function observeRuntimeErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`console: ${message.text()}`);
    }
  });
  return errors;
}

async function pageDiagnostic(page: Page, errors: readonly string[]): Promise<string> {
  const pageText = await page.locator('body').innerText();
  return `Runtime errors: ${errors.join(' | ') || 'none'}. Page: ${pageText}`;
}

async function enterName(page: Page, name: string, errors: readonly string[]) {
  await page.getByTestId('wizard-check').click();
  await page.getByTestId('name-input').fill(name);
  await page.getByTestId('confirm-name').click();
  await expect(page.getByTestId('ready-step')).toBeVisible();
  await page.getByTestId('start-practice').click();

  try {
    await expect(page.getByTestId('practice-step')).toBeVisible({ timeout: 8_000 });
  } catch {
    throw new Error(`Practice did not open. ${await pageDiagnostic(page, errors)}`);
  }
}

async function drawStroke(page: Page) {
  const canvas = page.getByTestId('writing-surface');
  const box = await canvas.boundingBox();
  if (box === null) {
    throw new Error('Writing canvas is not visible.');
  }
  await page.mouse.move(box.x + 60, box.y + 70);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 70, box.y + box.height - 80, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('.child-stroke')).toHaveCount(1);
}

async function advanceTo(page: Page, target: string, errors: readonly string[]) {
  await page.getByTestId('next-letter').click();
  try {
    await expect(page.getByText(target, { exact: true })).toBeVisible({ timeout: 8_000 });
  } catch {
    throw new Error(`Letter transition to ${target} failed. ${await pageDiagnostic(page, errors)}`);
  }
}

async function expectContextualLetter(page: Page, display: string, form: string) {
  const letter = page.getByTestId('contextual-letter');
  await expect(letter).toHaveText(display);
  await expect(letter).toHaveAttribute('data-form', form);
}

test('child completes a Persian name with contextual letter forms', async ({ page }) => {
  const errors = observeRuntimeErrors(page);
  await page.goto('/');
  await enterName(page, 'لیا', errors);

  await expectContextualLetter(page, 'لـ', 'initial');
  await drawStroke(page);
  await advanceTo(page, 'حرف 2 / 3', errors);
  await expectContextualLetter(page, 'ـیـ', 'medial');
  await drawStroke(page);
  await advanceTo(page, 'حرف 3 / 3', errors);
  await expectContextualLetter(page, 'ـا', 'final');
  await drawStroke(page);
  await page.getByTestId('next-letter').click();

  try {
    await expect(page.getByTestId('result-step')).toBeVisible({ timeout: 8_000 });
  } catch {
    throw new Error(`Result did not open. ${await pageDiagnostic(page, errors)}`);
  }
  await expect(page.getByTestId('composition-svg').getByRole('img')).toHaveAttribute('alt', 'لیا');
});

test('refresh resumes an active IndexedDB session and its contextual letter', async ({ page }) => {
  const errors = observeRuntimeErrors(page);
  await page.goto('/');
  await enterName(page, 'لی', errors);
  await expectContextualLetter(page, 'لـ', 'initial');
  await drawStroke(page);
  await advanceTo(page, 'حرف 2 / 2', errors);
  await expectContextualLetter(page, 'ـی', 'final');

  await page.reload();

  await expect(page.getByTestId('practice-step')).toBeVisible();
  await expect(page.getByText('تمرین قبلی‌ات از همان‌جا ادامه پیدا کرد.')).toBeVisible();
  await expect(page.getByText('حرف 2 / 2')).toBeVisible();
  await expectContextualLetter(page, 'ـی', 'final');
});
