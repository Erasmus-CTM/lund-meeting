// Interfaces regarding python execution and its data-flow

/**
 * What data are we interested in after running the user code?
 */
export interface ExecutionResult {
  // both of these might be useful for grading/ai feedback
  stdout: string;
  stderr: string;

  /** Maybe interesting? Renderable artifacts (plots, images, etc.) */
  //   artifacts?: ExecutionArtifact[];

  /** Wall-clock runtime */
  durationMs: number;

  /** Did the code run without errors? */
  ok: boolean;
}

/**
 * Wraps a (stateful) python interpreter.
 */
export interface PythonExecutionProvider {
  /** Initialize runtime (lazy allowed) */
  init?(): Promise<void>;

  /** Execute code in current session */
  run(code: string): Promise<ExecutionResult>;

  /** Reset of interpreter */
  reset?(): Promise<void>;

  /** Is this Provider usable. */
  isAvailable?(): boolean;
}
