import { beforeEach, describe, expect, it } from 'vitest';
import { resolveLessonSettings } from '@persian-writing/core';
import {
  hasLocalAdminPin,
  readLocalAdminSettings,
  saveLocalAdminSettings,
  setLocalAdminPin,
  verifyLocalAdminPin
} from '@/services/localAdminService';

describe('local administrator protection', () => {
  beforeEach(() => localStorage.clear());

  it('stores only a salted PIN derivation and verifies the correct PIN', async () => {
    await setLocalAdminPin('123456');
    expect(hasLocalAdminPin()).toBe(true);
    expect(localStorage.getItem('persian-writing-local-admin-credential-v1')).not.toContain('123456');
    await expect(verifyLocalAdminPin('123456')).resolves.toBe(true);
    await expect(verifyLocalAdminPin('654321')).resolves.toBe(false);
  });

  it('applies administrator defaults and locks without touching privacy consent', () => {
    saveLocalAdminSettings({
      defaults: { timedMode: true, timeLimitSeconds: 45 },
      locked: ['timedMode']
    });
    const admin = readLocalAdminSettings();
    const effective = resolveLessonSettings({
      administratorDefaults: admin.defaults,
      lockedByAdministrator: admin.locked,
      userOverrides: { timedMode: false, timeLimitSeconds: 20 }
    });

    expect(effective.timedMode).toBe(true);
    expect(effective.timeLimitSeconds).toBe(20);
    expect(localStorage.getItem('persian-writing-sync-consent-v1')).toBeNull();
  });
});
