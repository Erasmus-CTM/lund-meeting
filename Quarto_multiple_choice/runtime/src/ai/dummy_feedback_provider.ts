import {
  type AIFeedback,
  type AICredentials,
  type AIFeedbackProvider,
  type ModelMeta,
} from "../contracts/ai";

/**
 * Dummy AI API
 */
export class DummyFeedbackProvider implements AIFeedbackProvider {
  async models(options: AICredentials): Promise<ModelMeta[]> {
    return [
      { id: "nothing-more", created: 123, object: "abc", owned_by: "nobody" },
      { id: "nothing-less", created: 456, object: "xyz", owned_by: "nobody" },
    ];
  }

  async generate(prompt: string): Promise<AIFeedback> {
    return { summary: `dummy AI responding to ${prompt}` };
  }

  /**
   * Dummy is always available
   * @returns true
   */
  isAvailable(): boolean {
    return true;
  }

  async ping(options: AICredentials): Promise<string> {
    return "Hello im a dummy" + `(options: ${JSON.stringify(options)})`;
  }
}
