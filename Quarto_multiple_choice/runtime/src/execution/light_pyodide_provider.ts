import type {
  ExecutionResult,
  PythonExecutionProvider,
} from "../contracts/execution";

import { loadPyodide, version as pyoVer, type PyodideAPI } from "pyodide";

/**
 * Load the pyodide interpreter.
 *
 * NOTE: by importing from "pyodide" we can use npm to manage the version
 * while the WASM itself comes from the CDN (indexURL)
 *
 * @returns pyodide
 */
async function initPyodide() {
  console.log("loading pyodide v" + pyoVer);

  return await loadPyodide({
    fullStdLib: true, // default true, is it faster without?
    indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyoVer}/full/`,
  });
}

/**
 * Minimal Pyodide interpreter wrapper.
 */
export class LightPyodideProvider implements PythonExecutionProvider {
  pyodide: PyodideAPI | null = null;
  stdout: string[] = [];
  stderr: string[] = [];

  async init(): Promise<void> {
    this.pyodide = await initPyodide();
    // Prepare to capture output
    this.pyodide.setStdout({ batched: (s) => this.stdout.push(s) });
    this.pyodide.setStderr({ batched: (s) => this.stderr.push(s) });
  }
  async run(code: string): Promise<ExecutionResult> {
    this.resetOutput();
    // ensure intialized
    const pyo = this.pyodide;
    if (!pyo) throw new Error("pyodide not loaded");
    // run code
    let isOk = true;
    const t0 = Date.now();
    try {
      const res = await pyo.runPythonAsync(code);
      console.log("pyo res", res);
    } catch (error) {
      console.log("run python error");
      console.log(JSON.stringify(error));

      isOk = false;
    }
    const dur = Date.now() - t0;
    if (this.stderr.length > 0) {
      isOk = false;
    }

    // create result
    return {
      stdout: this.stdout.join("\n"),
      stderr: this.stderr.join("\n"),
      durationMs: dur,
      ok: isOk,
    };
  }
  async reset(): Promise<void> {
    // can we reset interpreter state quickly?
    // reset output
    this.resetOutput();
  }

  /**
   * clear accumulated stdout and stderr.
   */
  private resetOutput() {
    // reset own state
    this.stdout.length = 0;
    this.stderr.length = 0;
  }
  isAvailable(): boolean {
    return this.pyodide != null;
  }
}
