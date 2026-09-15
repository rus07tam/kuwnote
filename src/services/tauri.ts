/**
 * Tauri v2 bridge and web compatibility layer for Kuwnote
 * Package: org.ruject.kuwnote
 */

export interface TauriAppInfo {
  name: string;
  version: string;
  packageIdentifier: string;
  isTauri: boolean;
  platform: 'tauri' | 'web';
}

export const APP_INFO: TauriAppInfo = {
  name: 'Kuwnote',
  version: '2.0.0',
  packageIdentifier: 'org.ruject.kuwnote',
  isTauri: typeof window !== 'undefined' && ('__TAURI__' in window || '__TAURI_INTERNALS__' in window),
  platform: typeof window !== 'undefined' && ('__TAURI__' in window || '__TAURI_INTERNALS__' in window) ? 'tauri' : 'web',
};

export const TauriBridge = {
  isTauri(): boolean {
    return APP_INFO.isTauri;
  },

  async minimizeWindow(): Promise<void> {
    if (this.isTauri()) {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().minimize();
      } catch (e) {
        console.warn('Tauri window minimize error:', e);
      }
    } else {
      console.log('[Web Mode] Window minimize simulated');
    }
  },

  async toggleMaximizeWindow(): Promise<void> {
    if (this.isTauri()) {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().toggleMaximize();
      } catch (e) {
        console.warn('Tauri window maximize error:', e);
      }
    } else {
      console.log('[Web Mode] Window toggle maximize simulated');
    }
  },

  async closeWindow(): Promise<void> {
    if (this.isTauri()) {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().close();
      } catch (e) {
        console.warn('Tauri window close error:', e);
      }
    } else {
      console.log('[Web Mode] Window close simulated');
    }
  },

  getAppInfo(): TauriAppInfo {
    return APP_INFO;
  }
};
