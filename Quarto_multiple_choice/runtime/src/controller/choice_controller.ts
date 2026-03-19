import { FdbkTemplate, type ChoiceFdbkContext } from "../ai/templating";
import { type ChoiceMeta, type ControllerContext } from "../contracts/activity";
import { BaseActivityController } from "./base_activity_controller";
import { ChoiceUI } from "../ui/choice";

/**
 * Controller for "multiple choice"-activities
 */
export class ChoiceController extends BaseActivityController {
  protected readonly ui: ChoiceUI;
  private template: FdbkTemplate<ChoiceFdbkContext>;

  constructor(
    ctx: ControllerContext,
    protected readonly meta: ChoiceMeta,
    rawPrompt: string,
  ) {
    super(ctx);

    this.template = new FdbkTemplate(rawPrompt);
    // hydrate UI
    this.ui = new ChoiceUI(this.el);
    if (this.ui.question.options.length !== this.meta.options_md.length) {
      throw new Error("Choice: option count mismatch");
    }

    this.ui.debugBtn.addEventListener("click", () => {
      this.ui.toggleDebug({
        meta: meta,
        template: rawPrompt,
        historyLength: this.chatHistory.length,
      });
    });
  }

  async submit(): Promise<void> {
    // Check answers
    const answer = this.ui.getAnswer();
    const ok =
      answer.length === this.meta.correct.length &&
      answer.every((i) => this.meta.correct.includes(i));

    // Show result
    if (ok) {
      this.ui.disable();
    }
    this.ui.showResult(ok);
  }

  private idsToOptMd(ids: number[]): string {
    return ids.map((id) => this.meta.options_md[id]).join(", ");
  }

  async getFdbk(): Promise<void> {
    // Indices for answer and correct
    const ansIds = this.ui.getAnswer();
    const correctIds = this.meta.correct;
    const ansString = this.idsToOptMd(ansIds);

    // render template
    const renderedPrompt = this.template.render({
      QUESTION: this.meta.question_md,
      OPTIONS: this.meta.options_md.join(", "),
      CORRECT: this.idsToOptMd(correctIds),
      ANSWER: ansString,
    });
    // ask ai provider
    const creds = this.settings.load();
    if (!creds) throw new Error("No ai credentials stored");

    this.ui.showFeedbackLoading();

    // trim history if too long
    const includeHistory = this.chatHistory.slice(-this.maxHistoryLength);

    const fdbk = await this.ai.generate(
      renderedPrompt,
      creds,
      includeHistory,
      this.meta.learningGoals,
      undefined,
    );

    // Append both messages to history
    if (this.meta.useChatHistory) {
      this.chatHistory.push(
        { role: "user", content: renderedPrompt },
        { role: "assistant", content: fdbk.summary, causedBy: ansString },
      );
    }

    if (this.autoSave) {
      this.persistState();
    }

    // step to latest feedback
    this.feedbackIndex = -1;
    // display result
    this.refreshFeedbackUI();
  }
}
