import { type ExecutionResult } from "./execution";
import { type BaseActivityMeta } from "./activity";

/**
 * Maybe too many interfaces, but there are a few things that go together with the "executionResult"
 */
export interface EvaluationSnapshot {
  exercise: BaseActivityMeta;

  source: string;

  result: ExecutionResult;

  // useful for feedback
  teacherPrompt?: string;
}
