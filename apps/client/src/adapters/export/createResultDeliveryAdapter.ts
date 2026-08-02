import type { ResultDeliveryPort } from '@persian-writing/core';
import { isTauriRuntime } from '@/runtime/isTauriRuntime';
import { BrowserResultDeliveryAdapter } from './BrowserResultDeliveryAdapter';

export async function createResultDeliveryAdapter(): Promise<ResultDeliveryPort> {
  if (isTauriRuntime()) {
    const { TauriResultDeliveryAdapter } = await import('./TauriResultDeliveryAdapter');
    return new TauriResultDeliveryAdapter();
  }
  return new BrowserResultDeliveryAdapter();
}
