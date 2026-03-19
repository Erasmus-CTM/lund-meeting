import type { ChatTurn } from "./ai";

/**
 * For storing activity progress and data.
 * Originally implemented with LocalStorage.
 * Async for smooth transition to IndexedDb/Server/etc
 */
export interface ActStorage {
  load(pageId: string, activityId: string): Promise<ActivityState | null>;

  save(pageId: string, activityId: string, state: ActivityState): Promise<void>;
}

/**
 * Idea, extra content ("mini-documents") can be stored.
 * When needed these can be presented to the user, or given to AI.
 *
 * These can be loaded using an explicit ID,
 * similarly to how RAG-retrieval loads context with a fuzzy query
 */
export interface MiniDocStorage {
  load(id: string): Promise<MiniDoc | null>;
}
export interface MiniDoc {
  content_md: string;
  summary?: string; // One sentence summary?
  tags?: string[];
}

export type ActivityStatus = "in-progress" | "completed";

/**
 * Persisted state for one activity
 */
export interface ActivityState {
  chatHistory: ChatTurn[];
  status: ActivityStatus;
  updatedAt: number; // timestamp
}
