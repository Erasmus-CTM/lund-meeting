// User settings, api key etc...

import type { AICredentials } from "../contracts/ai";

/**
 * Stores and loads settings in localstorage
 */

export class SettingsStorage {
  STORAGE_KEY = "settings.ai";

  load(): AICredentials | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AICredentials;
    } catch {
      return null;
    }
  }

  save(creds: AICredentials) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(creds));
  }

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
