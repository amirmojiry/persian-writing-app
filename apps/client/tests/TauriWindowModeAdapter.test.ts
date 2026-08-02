import { describe, expect, it, vi } from 'vitest';
import { TauriWindowModeAdapter } from '../src/adapters/window/TauriWindowModeAdapter';

describe('TauriWindowModeAdapter', () => {
  it('restores the previous window state when entering kiosk fails', async () => {
    const window = {
      isFullscreen: vi.fn().mockResolvedValue(false),
      isDecorated: vi.fn().mockResolvedValue(true),
      isAlwaysOnTop: vi.fn().mockResolvedValue(false),
      setFullscreen: vi.fn().mockResolvedValue(undefined),
      setAlwaysOnTop: vi.fn().mockRejectedValueOnce(new Error('denied')).mockResolvedValue(undefined),
      setDecorations: vi.fn().mockResolvedValue(undefined),
      setFocus: vi.fn().mockResolvedValue(undefined)
    };
    const adapter = new TauriWindowModeAdapter(window);

    await expect(adapter.setKiosk(true)).rejects.toThrow('denied');

    expect(window.setFullscreen).toHaveBeenLastCalledWith(false);
    expect(window.setAlwaysOnTop).toHaveBeenLastCalledWith(false);
    expect(window.setDecorations).toHaveBeenLastCalledWith(true);
  });
});
