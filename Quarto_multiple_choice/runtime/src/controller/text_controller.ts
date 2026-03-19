import { FdbkTemplate, type TextFdbkContext } from "../ai/templating";
import { type ControllerContext, type TextMeta } from "../contracts/activity";
import { BaseActivityController } from "./base_activity_controller";
import type { AIFeedback } from "../contracts/ai";
import { TextActivityUI } from "../ui/text_activity_ui";

/**
 * Controller for "multiple choice"-activities
 */
export class TextController extends BaseActivityController {
  protected readonly ui: TextActivityUI;
  private template: FdbkTemplate<TextFdbkContext>;
  private gradingTemplate: FdbkTemplate<TextFdbkContext> | null;

  constructor(
    ctx: ControllerContext,
    protected readonly meta: TextMeta,
    rawFdbkTemplate: string,
    rawGradingTemplate: string | null,
  ) {
    super(ctx);
    this.template = new FdbkTemplate(rawFdbkTemplate);
    this.gradingTemplate = rawGradingTemplate
      ? new FdbkTemplate(rawGradingTemplate)
      : null;

    // hydrate UI
    this.ui = new TextActivityUI(this.el);

    this.ui.debugBtn.addEventListener("click", () => {
      this.ui.toggleDebug({
        meta: meta,
        template: rawFdbkTemplate,
        historyLength: this.chatHistory.length,
      });
    });
  }

  private getFdbkContext(): TextFdbkContext {
    return {
      QUESTION: this.meta.question_md,
      ANSWER: this.ui.getAnswer(),
    };
  }

  async submit(): Promise<void> {
    // Check answers
    const answer = this.ui.getAnswer();
    let ok = false;
    if (this.meta.grading == "ai") {
      this.ui.showFeedbackLoading();
      const tmpl = this.gradingTemplate;
      if (!tmpl) throw new Error("missing grading template");
      // ask ai to grade answer
      const renderedPrompt = tmpl.render(this.getFdbkContext());
      const result = await this.askAi(renderedPrompt);
      console.log("AI GRADING:", result.summary);
      ok = result.summary.toLowerCase().trim() == "correct";
    } else if (this.meta.grading == "normalized-exact") {
      // exact text match?
      ok = this.meta.correct?.toLowerCase() === answer.trim().toLowerCase();
    }

    // Show result
    if (ok) {
      this.ui.disable();
    }
    this.ui.showResult(ok);
  }

  /**
   * Ask ai and update history etc
   * @param msg
   */
  private async askAi(msg: string, causedBy?: string): Promise<AIFeedback> {
    const creds = this.settings.load();
    if (!creds) throw new Error("No ai credentials stored");

    // trim history if too long
    const includeHistory = this.chatHistory.slice(-this.maxHistoryLength);

    const response = await this.ai.generate(
      msg,
      creds,
      includeHistory,
      this.meta.learningGoals,
      undefined,
    );

    // Append both messages to history
    if (this.meta.useChatHistory) {
      this.chatHistory.push(
        { role: "user", content: msg },
        { role: "assistant", content: response.summary, causedBy: causedBy },
      );
    }

    return response;
  }

  async getFdbk(): Promise<void> {
    const ctx = this.getFdbkContext();
    // render template
    const renderedPrompt = this.template.render(ctx);
    // ask ai provider

    this.ui.showFeedbackLoading();
    await this.askAi(renderedPrompt, ctx.ANSWER);

    if (this.autoSave) {
      this.persistState();
    }

    // step to latest feedback
    this.feedbackIndex = -1;
    // display result
    this.refreshFeedbackUI();
  }
}
