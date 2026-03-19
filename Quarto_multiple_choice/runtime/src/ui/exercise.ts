import type { AIFeedback } from "../contracts/ai";
import type { ExecutionResult } from "../contracts/execution";
import type { CodeExerciseController } from "../controller/exercise_controller";

/**
 * Simple Viewmodel/binding layer for an exercise.
 */
export class CodeExerciseUI {
  constructor(
    private readonly root: HTMLElement,
    private readonly controller: CodeExerciseController,
  ) {
    this.bindEvents();
  }

  // DOM lookups

  private get textarea() {
    return this.root.querySelector(".exercise-input") as HTMLTextAreaElement;
  }

  private get submitBtn() {
    return this.root.querySelector(".btn-submit") as HTMLButtonElement;
  }

  private get resetBtn() {
    return this.root.querySelector(".btn-reset") as HTMLButtonElement;
  }

  private get feedbackBtn() {
    return this.root.querySelector(".btn-feedback") as HTMLButtonElement;
  }

  private get outputBox() {
    return this.root.querySelector(".output-box") as HTMLDivElement;
  }

  private get feedbackBox() {
    return this.root.querySelector(".feedback-box") as HTMLDivElement;
  }

  private get spinner(): HTMLElement | null {
    return this.root.querySelector<HTMLElement>(".spinner");
  }

  // event wiring

  private bindEvents() {
    this.submitBtn.addEventListener("click", () => this.onSubmit());

    this.resetBtn.addEventListener("click", () => this.onReset());

    this.feedbackBtn.addEventListener("click", () => this.onFeedback());
  }

  // handlers

  private async onSubmit() {
    this.setBusy(true);
    this.outputBox.textContent = "TODO"; // clear output

    // try {
    //   const result = await this.controller.submit({
    //     source: this.textarea.value,
    //   });

    //   this.feedbackBtn.disabled = false;
    //   this.renderOutput(result);
    // } catch (err) {
    //   // Problem with running the code?
    //   this.renderError(err);
    // } finally {
    //   this.setBusy(false);
    // }
  }

  private async onFeedback() {
    this.setBusy(true);
    this.feedbackBox.textContent = ""; // clear feedback output

    try {
      const fdbk = await this.controller.requestFeedback();
      this.renderFdbk(fdbk);
    } catch (err) {
      this.renderError(err);
    } finally {
      this.setBusy(false);
    }
  }

  private onReset() {
    this.controller.restart();

    this.textarea.value = "";
    this.feedbackBtn.disabled = true;
    this.outputBox.textContent = "";
  }

  // UI updates

  private renderOutput(result: ExecutionResult) {
    if (result.ok) {
      this.outputBox.textContent = result.stdout;
    } else {
      this.outputBox.textContent = result.stderr;
    }

    // Quick and dirty color feedback
    this.outputBox.parentElement?.classList.add(
      result.ok ? "correct" : "wrong",
    );
    this.outputBox.parentElement?.classList.remove(
      !result.ok ? "correct" : "wrong",
    );
  }

  private renderFdbk(fdbk: AIFeedback) {
    this.feedbackBox.textContent = fdbk.summary;
  }

  private renderError(err: unknown) {
    this.outputBox.textContent =
      err instanceof Error ? err.message : String(err);
  }

  private setBusy(busy: boolean) {
    this.submitBtn.disabled = busy;
    this.resetBtn.disabled = busy;
    this.feedbackBtn.disabled = busy || this.feedbackBtn.disabled;

    if (this.spinner) {
      this.spinner.style.display = busy ? "block" : "none";
    }
  }
}
