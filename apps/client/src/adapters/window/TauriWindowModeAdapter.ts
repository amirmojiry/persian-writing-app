import { getCurrentWindow } from '@tauri-apps/api/window';
import type { WindowModePort } from '@persian-writing/core';

interface TauriWindowLike {
  isFullscreen(): Promise<boolean>;
  isDecorated(): Promise<boolean>;
  isAlwaysOnTop(): Promise<boolean>;
  setDecorations(enabled: boolean): Promise<void>;
  setAlwaysOnTop(enabled: boolean): Promise<void>;
  setFullscreen(enabled: boolean): Promise<void>;
  setFocus(): Promise<void>;
}

interface WindowState {
  readonly fullscreen: boolean;
  readonly decorated: boolean;
  readonly alwaysOnTop: boolean;
}

export class TauriWindowModeAdapter implements WindowModePort {
  readonly available = true;

  constructor(private readonly window: TauriWindowLike = getCurrentWindow()) {}

  async isKiosk(): Promise<boolean> {
    return await this.window.isFullscreen();
  }

  async setKiosk(enabled: boolean): Promise<void> {
    const previous = await this.captureState();
    try {
      await this.applyState({
        fullscreen: enabled,
        decorated: !enabled,
        alwaysOnTop: enabled
      });
      if (enabled) {
        await this.window.setFocus();
      }
    } catch (error) {
      await this.restoreState(previous);
      throw error;
    }
  }

  private async captureState(): Promise<WindowState> {
    const [fullscreen, decorated, alwaysOnTop] = await Promise.all([
      this.window.isFullscreen(),
      this.window.isDecorated(),
      this.window.isAlwaysOnTop()
    ]);
    return { fullscreen, decorated, alwaysOnTop };
  }

  private async applyState(state: WindowState): Promise<void> {
    await this.window.setFullscreen(state.fullscreen);
    await this.window.setAlwaysOnTop(state.alwaysOnTop);
    await this.window.setDecorations(state.decorated);
  }

  private async restoreState(state: WindowState): Promise<void> {
    await Promise.allSettled([
      this.window.setFullscreen(state.fullscreen),
      this.window.setAlwaysOnTop(state.alwaysOnTop),
      this.window.setDecorations(state.decorated)
    ]);
  }
}
