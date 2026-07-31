import { getCurrentWindow } from '@tauri-apps/api/window';
import type { WindowModePort } from '@persian-writing/core';

export class TauriWindowModeAdapter implements WindowModePort {
  readonly available = true;
  private readonly window = getCurrentWindow();

  async isKiosk(): Promise<boolean> {
    return await this.window.isFullscreen();
  }

  async setKiosk(enabled: boolean): Promise<void> {
    await this.window.setDecorations(!enabled);
    await this.window.setAlwaysOnTop(enabled);
    await this.window.setFullscreen(enabled);
    if (enabled) {
      await this.window.setFocus();
    }
  }
}
