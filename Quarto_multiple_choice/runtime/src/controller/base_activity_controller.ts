import type { SettingsStorage } from "../storage/settings_storage";
import type {
  ActivityController,
  AnyActivityMeta,
  ControllerContext,
} from "../contracts/activity";
import type { AIFeedbackProvider, ChatTurn } from "../contracts/ai";
import type { ActivityStatus, ActStorage } from "../contracts/storage";
import type { BaseActivityUI } from "../ui/base_activity_ui";

/**
 * Implements common logic for activities
 */

export abstract class BaseActivityController implements ActivityController {
  protected readonly el: HTMLElement;
  protected readonly ai: AIFeedbackProvider;
  protected readonly settings: SettingsStorage;
  protected readonly storage: ActStorage;

  protected chatHistory: ChatTurn[] = [];
  protected feedbackIndex: number = -1; // default: show latest

  // some constants
  protected autoSave: boolean = true;
  protected maxHistoryLength: number = 4;

  // Subclass specific attributes
  protected abstract ui: BaseActivityUI;
  protected abstract meta: AnyActivityMeta;

  // Subclass specific methods
  // TODO: split up and move common logic!
  abstract submit(): Promise<void>;
  abstract getFdbk(): Promise<void>;

  constructor(ctx: ControllerContext) {
    this.el = ctx.el;
    this.ai = ctx.ai;
    this.settings = ctx.settings;
    this.storage = ctx.storage;
  }

  /**
   * Init logic that needs to run after constructor is finished
   */
  public async init() {
    // Setup button actions
    this.ui.submitBtn.addEventListener("click", () => this.submit());
    this.ui.feedbackBtn.addEventListener("click", () => this.getFdbk());
    this.ui.clearHistBtn.addEventListener("click", () => this.clearHistory());

    await this.loadState();
  }

  getPageId(): string {
    return this.el.ownerDocument.URL;
  }

  /**
   * Load the activity state from storage service
   */
  protected async loadState(): Promise<void> {
    const state = await this.storage.load(this.getPageId(), this.meta.id);
    if (!state) return;
    console.log("LOADED STATE", state);

    this.chatHistory = state.chatHistory;
    this.feedbackIndex = -1;

    // show loaded feedback if has
    if (this.chatHistory) {
      this.refreshFeedbackUI();
    }
  }
  /**
   * Save the activity state to storage service
   */
  protected async persistState(status?: ActivityStatus) {
    await this.storage.save(this.getPageId(), this.meta.id, {
      chatHistory: this.chatHistory,
      status: status ?? "in-progress",
      updatedAt: Date.now(),
    });
    console.log(`SAVED STATE:${this.chatHistory.length} chats`);
  }

  // --- logic for feedback below ---
  /**
   * Get only feedback from history
   */
  assistantHistory(): ChatTurn[] {
    return this.chatHistory.filter((h) => h.role === "assistant");
  }

  /**
   * Get a feeback to show
   */
  protected currentFeedback(): ChatTurn | null {
    const hist = this.assistantHistory();
    if (hist.length === 0) return null;

    if (this.feedbackIndex === -1) {
      // default: latest
      this.feedbackIndex = hist.length - 1;
    }
    return hist[this.feedbackIndex];
  }

  protected stepFeedback(dir: -1 | 1): ChatTurn | null {
    const hist = this.assistantHistory();
    if (hist.length === 0) return null;

    this.feedbackIndex = Math.max(
      0,
      Math.min(hist.length - 1, this.feedbackIndex + dir),
    );
    return hist[this.feedbackIndex];
  }

  protected refreshFeedbackUI() {
    const hist = this.assistantHistory();

    if (hist.length == 0) {
      this.ui.removeFdbk();
    }

    const turn = this.currentFeedback();
    if (!turn) return;

    this.ui.showFeedbackTurn(
      turn,
      this.feedbackIndex,
      hist.length,
      () => {
        const t = this.stepFeedback(-1);
        if (t) this.refreshFeedbackUI();
      },
      () => {
        const t = this.stepFeedback(1);
        if (t) this.refreshFeedbackUI();
      },
    );
  }
  protected clearHistory() {
    if (confirm("clear history?")) {
      this.chatHistory.length = 0;
      this.feedbackIndex = -1;
      this.refreshFeedbackUI();
      this.persistState();
    }
  }
}
