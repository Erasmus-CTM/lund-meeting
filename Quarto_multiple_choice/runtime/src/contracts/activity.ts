import type { SettingsStorage } from "../storage/settings_storage";
import type { AIFeedbackProvider } from "./ai";
import type { ActStorage } from "./storage";

/** Ground truth defining allowed types */
const ACTIVITY_TYPES = ["choice", "text", "code"] as const; //  "cloze?"
type ActivityType = (typeof ACTIVITY_TYPES)[number];

/**
 * Runtime validation for activity type
 * @param x supposed activity type
 * @returns
 */

export function isActivityType(x: string | null): x is ActivityType {
  return x !== null && ACTIVITY_TYPES.includes(x as ActivityType);
}

/**
 * Metadata needed for every activity.
 */
export interface BaseActivityMeta {
  id: string;
  type: ActivityType; // Override in specific meta interfaces
  prompt_key: string;
  // original markdown
  question_md: string;
  /** Could be useful for feedback, giving as context to AI.*/
  learningGoals?: string[];
  /** Whether or not to store history when making AI feedback */
  useChatHistory: boolean;
}

export interface ChoiceMeta extends BaseActivityMeta {
  type: "choice";
  correct: number[];
  options_md: string[];
}
export interface TextMeta extends BaseActivityMeta {
  type: "text";
  grading: "ai" | "normalized-exact";
  prompt_key_grading?: string;
  correct?: string; // needed if not using ai-grading
}
export interface CodeMeta extends BaseActivityMeta {
  type: "code";
}

/**
 * Convenience for allowed activity types
 */
export type AnyActivityMeta = ChoiceMeta | TextMeta | CodeMeta;

/**
 * Initially just the python source code, but might be expanded if we introduce Exercise types.
 */
export interface ExerciseSubmission {
  /** Fully materialized Python source */
  source: string;
  // Could add data depending on exercise types
}

/**
 * Each type of activity implements this
 * TODO...
 */
export interface ActivityController {
  submit(): Promise<void>;
  getFdbk(): Promise<void>;
}
/**
 * What data is needed to create a controller
 */
export interface ControllerContext {
  el: HTMLElement;

  ai: AIFeedbackProvider;
  settings: SettingsStorage;
  storage: ActStorage;

  rawPrompts: Record<string, string | undefined>;
}

export interface Activity {
  meta: BaseActivityMeta;
  controller: ActivityController;
}

export interface ActivityCollection {
  activitities: Activity[];
}
