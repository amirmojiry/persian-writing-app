import { appMetadata } from '../src';

describe('application metadata', () => {
  it('declares the client as offline-first', () => {
    expect(appMetadata.offlineFirst).toBe(true);
  });
});
