import type {
  ExecutionResult,
  PythonExecutionProvider,
} from "../contracts/execution";

/**
 * Idea: clean api that controls a web worker.
 * Allows Async python access, without blocking main thread.
 */
class WorkerPyodideProvider implements PythonExecutionProvider {
  init?(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  run(code: string): Promise<ExecutionResult> {
    throw new Error("Method not implemented.");
  }
  reset?(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  isAvailable?(): boolean {
    throw new Error("Method not implemented.");
  }
}
