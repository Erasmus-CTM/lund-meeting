import type {
  AIFeedback,
  AICredentials,
  AIFeedbackProvider,
  ModelMeta,
  ChatTurn,
} from "../contracts/ai";
import { AiInteractionError } from "./errors";

/**
 * Should work for generic online services (Cerebras, OpenRouter, etc)
 * "OpenAI-compatible API"
 */
export class HttpAIProvider implements AIFeedbackProvider {
  constructor(private system_prompt: string) {}
  /**
   * Build messages and request a response based on certain data.
   */
  async generate(
    prompt: string,
    creds: AICredentials,
    history: ChatTurn[] = [], // previous turns
    learningGoals?: string[],
    userQuery?: string, // optionally: extra question
  ): Promise<AIFeedback> {
    if (!creds.model) {
      throw new Error("Please choose a model first.");
    }

    const chatUrl = `${creds.baseUrl}/chat/completions`;

    // === Building messages ===
    const systemMessage = {
      role: "system" as const,
      content: this.system_prompt,
    };

    if (learningGoals && learningGoals.length > 0) {
      systemMessage.content += `\nLearning goals: ${learningGoals.join(", ")}`;
    }

    // kind of a "user" message
    const activityGeneratedMessage = {
      role: "user" as const,
      content: prompt,
    };

    const messages: ChatTurn[] = [
      systemMessage,
      ...history,
      activityGeneratedMessage,
    ];

    console.log(
      `sending to ai (plus ${history.length} history):`,
      activityGeneratedMessage,
    );

    if (userQuery) {
      // extra question, optional
      messages.push({
        role: "user" as const,
        content: userQuery,
      });
    }

    const requestData = {
      messages: messages,
      model: creds.model,
    };

    // Request to url
    const r = await fetch(chatUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    // JSON format.
    const txt = (await r.json()).choices[0].message.content;

    // validate response:
    if (typeof txt !== "string") {
      throw new Error("weird message content: " + typeof txt);
    }

    return { summary: txt };
  }

  isAvailable(): boolean {
    throw new Error("Method not implemented.");
  }

  /**
   * Check which models are available
   * @returns Array of model metadata
   */
  async models(options: AICredentials): Promise<ModelMeta[]> {
    const modelsUrl = `${options.baseUrl}/models`;

    let resp: Response;
    try {
      resp = await fetch(modelsUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      // SSL/DNS etc errors
      throw AiInteractionError.classifyNetworkError(err, options.baseUrl);
    }

    if (!resp.ok) {
      // http errors
      throw AiInteractionError.classifyHttpError(resp);
    }

    return (await resp.json()).data;
  }

  /**
   * Send a test message to the AI
   */
  async ping(opts: AICredentials): Promise<string> {
    const chatUrl = `${opts.baseUrl}/chat/completions`;

    const model = opts.model;
    if (!model) throw new Error("Choose a model!");

    // Prepare the request data
    const requestData = {
      messages: [
        {
          role: "system",
          content: "You are a programming teacher, giving short answers.",
        },
        {
          role: "user",
          content: "Answer in 2 sentences: Who are you?",
        },
      ],
      model: model,
    };

    const resp = await fetch(chatUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify(requestData),
    });
    const data = await resp.json();

    if (!resp.ok) {
      // probably an error message:
      throw new Error("message" in data ? data.message : JSON.stringify(data));
    }

    return data.choices[0].message.content;
  }
}
