import type { ChatTurn } from "../contracts/ai";
import { FeedbackBox } from "./feedback_box";

export abstract class BaseActivityUI {
  readonly toolbar: HTMLElement;
  readonly submitBtn: HTMLButtonElement;
  readonly feedbackBtn: HTMLButtonElement;
  readonly debugBtn: HTMLButtonElement;
  readonly clearHistBtn: HTMLButtonElement;
  // Created when needed
  protected feedbackEl: HTMLElement | null = null;
  protected debugEl: HTMLElement | null = null;

  constructor(protected readonly root: HTMLElement) {
    this.toolbar = this.ensureToolbar();
    this.submitBtn = this.createButton("Submit");
    this.feedbackBtn = this.createButton("Feedback");
    this.clearHistBtn = this.createButton("Clear history");
    this.debugBtn = this.createButton("(debug)");

    // dont allow fdbk from the start
    this.enableFdbkBtn(false);

    this.toolbar.append(
      this.submitBtn,
      this.feedbackBtn,
      this.clearHistBtn,
      this.debugBtn,
    );
  }

  protected ensureToolbar(): HTMLElement {
    let tb = this.root.querySelector(".activity-toolbar") as HTMLElement;
    if (!tb) {
      tb = document.createElement("div");
      tb.className = "activity-toolbar";
      this.root.appendChild(tb);
    }
    return tb;
  }

  /**
   * Convenience for making buttons
   * @param label
   * @returns
   */
  private createButton(label: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    return btn;
  }

  public showFeedbackLoading(): void {
    if (!this.feedbackEl) {
      this.feedbackEl = document.createElement("div");
      this.feedbackEl.className = "activity-feedback loading";
      this.toolbar.after(this.feedbackEl);
    }

    this.feedbackEl.textContent = "Thinking…";
    this.feedbackEl.hidden = false;

    // already got feedback, wait until try again
    this.enableFdbkBtn(false);
  }

  protected enableFdbkBtn(enable: boolean) {
    this.feedbackBtn.disabled = !enable;
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

  /**
   * Show a feedback message
   * @param turn A chat message from the assistant
   * @param index number in history
   * @param total number of available feedback messages
   * @param onPrev step callback
   * @param onNext step callback
   */
  showFeedbackTurn(
    turn: ChatTurn,
    index: number,
    total: number,
    onPrev: () => void,
    onNext: () => void,
  ): void {
    const el = FeedbackBox({
      text: turn.content,
      causedBy: turn.causedBy,
      index: index,
      count: total,
      onPrev: index > 0 ? onPrev : null,
      onNext: index < total - 1 ? onNext : null,
    });
    if (!this.feedbackEl) {
      this.toolbar.after(el);
    } else {
      this.feedbackEl.replaceWith(el);
    }
    this.feedbackEl = el;
    this.feedbackEl.hidden = false;
    this.enableFdbkBtn(false);
  }
  removeFdbk() {
    this.feedbackEl?.remove();
    this.feedbackEl = null;
  }
}
