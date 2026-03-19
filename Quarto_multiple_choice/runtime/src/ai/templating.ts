type MultiChoiceKeys = "QUESTION" | "OPTIONS" | "CORRECT" | "ANSWER";

/**
 * Each type of feedback template extends this
 */
export type FdbkContext = Record<string, string>;

/**
 * Context data for multiple choice feedback
 */
export interface ChoiceFdbkContext extends FdbkContext {
  QUESTION: string;
  OPTIONS: string;
  CORRECT: string;
  ANSWER: string;
}
/**
 * Context data for text input feedback
 */
export interface TextFdbkContext extends FdbkContext {
  QUESTION: string;
  ANSWER: string;
}

/**
 * How to render feedback prompt.
 * Instances of these are owned by activity Controllers,
 * which render and pass the finished prompt to the AI provider
 */
export class FdbkTemplate<T extends FdbkContext> {
  constructor(private readonly raw: string) {}
  render(fill: T) {
    const used = new Set<string>();

    const result = this.raw.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
      if (!(key in fill)) {
        throw new Error(`Missing fill value for "${key}"`);
      }
      used.add(key);
      return fill[key];
    });
    return result;
  }
}
