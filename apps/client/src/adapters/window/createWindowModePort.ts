import type { WindowModePort } from '@persian-writing/core';
import { isTauriRuntime } from '@/runtime/isTauriRuntime';

const unavailableWindowMode: WindowModePort = Object.freeze({
  available: false,
  async isKiosk(): Promise<boolean> {
    return false;
  },
  async setKiosk(): Promise<void> {
    return;
  }
});

export async function createWindowModePort(): Promise<WindowModePort> {
  if (!isTauriRuntime()) {
    return unavailableWindowMode;
  }
  const { TauriWindowModeAdapter } = await import('./TauriWindowModeAdapter');
  return new TauriWindowModeAdapter();
}
