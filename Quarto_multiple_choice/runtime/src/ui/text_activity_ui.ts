import { BaseActivityUI } from "./base_activity_ui";

export class TextActivityUI extends BaseActivityUI {
  inputEl: HTMLElement;
  constructor(root: HTMLElement) {
    super(root);
    this.inputEl = this.getTextInput();
  }

  private getTextInput(): HTMLElement {
    const el = this.root.querySelector<HTMLElement>('[name="text-input"]');
    if (!el) throw new Error("missing text-input element");

    return el;
  }

  getAnswer(): string {
    if (this.inputEl instanceof HTMLInputElement) {
      return this.inputEl.value;
    }
    return this.inputEl.textContent;
  }

  disable(): void {
    this.submitBtn.disabled = true;
  }

  showResult(correct: boolean): void {
    this.root.classList.toggle("correct", correct);
    this.root.classList.toggle("incorrect", !correct);
    // did a try, can get feedback
    this.enableFdbkBtn(true);
  }

  /* ---------------- Debug Help ---------------- */

  toggleDebug(data: object): void {
    if (this.debugEl) {
      this.debugEl.remove();
      this.debugEl = null;
    } else {
      this.debugEl = document.createElement("pre");
      this.debugEl.className = "activity-debug-info";
      this.toolbar.after(this.debugEl);
      this.debugEl.textContent = JSON.stringify(data, undefined, 2);
    }
  }
}
