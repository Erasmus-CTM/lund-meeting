import type { AIFeedback, AIFeedbackProvider } from "../contracts/ai";
import type { EvaluationSnapshot } from "../contracts/eval";
import type {
  ExecutionResult,
  PythonExecutionProvider,
} from "../contracts/execution";
import type {
  ActivityController,
  BaseActivityMeta,
  ExerciseSubmission,
} from "../contracts/activity";
import type { SettingsStorage } from "../storage/settings_storage";

/**
 * Manages state and exercise lifecycle, depends on providers.
 * Encapsulate all state here to avoid leaking it to UI etc.
 *
 * This should not directly work with the DOM,
 * ideally have sort of a "viewmodel" between
 */
export class CodeExerciseController implements ActivityController {
  constructor(
    private readonly meta: BaseActivityMeta,
    private readonly exec: PythonExecutionProvider,
    private readonly ai: AIFeedbackProvider,
    private readonly settings: SettingsStorage,
  ) {}
  getFdbk(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  mount(): void {
    throw new Error("Method not implemented.");
  }

  // state

  private lastSubmission?: ExerciseSubmission;
  private lastExecution?: ExecutionResult;
  //   private lastError?: Error;

  // maybe these type of flags are useful when we have more async things going on
  //   private busy: boolean = false;

  // lifecycle actions

  async submit(): Promise<void> {
    throw new Error("not refactored");
  }

  //   async submit(submission: ExerciseSubmission): Promise<ExecutionResult> {
  //     this.lastSubmission = submission;
  //     this.lastExecution = await this.exec.run(submission.source);
  //     return this.lastExecution;
  //   }

  async requestFeedback(): Promise<AIFeedback> {
    const credentials = this.settings.load();
    if (!credentials) throw new Error("No AI credentials stored");

    const fdbk = await this.ai.generate(
      "TODO",
      credentials,
      [],
      undefined,
      undefined,
    );
    return fdbk;
  }

  restart(): void {
    throw new Error("Method not implemented.");
  }
  /**
   * Helper to handle data after attempt
   */
  protected buildSnapshot(): EvaluationSnapshot {
    const result = this.lastExecution;
    const subm = this.lastSubmission;

    if (!subm) throw new Error("Submit exercise first");
    if (!result) throw new Error("Needs execution result");

    return {
      exercise: this.meta,
      source: subm.source,
      result: result,
    };
  }
}
