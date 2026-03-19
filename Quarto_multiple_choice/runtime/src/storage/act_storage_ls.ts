import type { ActivityState, ActStorage } from "../contracts/storage";

/**
 * Store activity states in a LocalStorage blob
 */
export class ActStorageLs implements ActStorage {
  private key = "activity-state-v1";

  async load(pageId: string, activityId: string) {
    const raw = localStorage.getItem(this.key);
    if (!raw) return null;

    const data = JSON.parse(raw);
    return data?.[pageId]?.[activityId] ?? null;
  }

  async save(pageId: string, activityId: string, state: ActivityState) {
    const raw = localStorage.getItem(this.key);
    const data = raw ? JSON.parse(raw) : {};

    data[pageId] ??= {};
    data[pageId][activityId] = state;

    localStorage.setItem(this.key, JSON.stringify(data));
  }
}
