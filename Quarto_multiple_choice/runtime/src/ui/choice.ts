import type { ChoiceOption, ChoiceQuestion } from "../contracts/choice";
import { BaseActivityUI } from "./base_activity_ui";

export class ChoiceUI extends BaseActivityUI {
  readonly question: ChoiceQuestion;

  constructor(root: HTMLElement) {
    super(root);
    this.question = this.captureQuestionOptions();
  }

  /* ---------------- hydration ---------------- */

  private captureQuestionOptions(): ChoiceQuestion {
    const ul = this.root.querySelector("ul");
    if (!ul) throw new Error("Choice activity missing <ul>");

    const options: ChoiceOption[] = [];
    ul.querySelectorAll("li").forEach((li, index) => {
      const input = li.querySelector(
        "input[type=checkbox]",
      ) as HTMLInputElement;
      if (!input) throw new Error("Option missing checkbox");

      //   const text = li.textContent?.trim() ?? ""; not needed...

      options.push({
        index,
        input: input,
      });
    });

    return { options };
  }

  getAnswer(): number[] {
    return this.question.options
      .filter((o) => o.input.checked)
      .map((o) => o.index);
  }

  disable(): void {
    this.question.options.forEach((o) => (o.input.disabled = true));
    this.submitBtn.disabled = true;
  }

  showResult(correct: boolean): void {
    this.root.classList.toggle("correct", correct);
    this.root.classList.toggle("incorrect", !correct);
    // did a try, can get feedback
    this.enableFdbkBtn(true);
  }
}
