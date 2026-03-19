import type {
  AIFeedback,
  AICredentials,
  AIFeedbackProvider,
  ModelMeta,
  PromptSetup,
} from "../contracts/ai";
import type { EvaluationSnapshot } from "../contracts/eval";
import { AiInteractionError } from "./errors";

/**
 * Should work for generic online services (Cerebras, OpenRouter, etc)
 * "OpenAI-compatible API"
 * can also use local AI (LM Studio, Ollama, etc) (idk if this is feasible on laptops, but works the same)
 *
 * Consider: CORS (but it seems to work fine with the providers we tried)
 */
export class OldHttpAIProvider {
  //   prompts = {
  //     system: "You are ...",
  //     pre_source: "Review ...",
  //     post_source: "Your feedback ...",
  //   };
  constructor(private prompts: PromptSetup) {
    console.error("DEPRECATED??");
    console.log(
      "hello, im a ai provider with prompots: " +
        JSON.stringify(Object.keys(prompts)),
    );
  }
  /**
   * TODO: completions vs responses API?
   * @param snapshot The context needed from exercise submission/execution
   */
  async generate(
    snapshot: EvaluationSnapshot,
    options: AICredentials,
  ): Promise<AIFeedback> {
    if (!options.model) {
      console.warn("TODO default model choice?");
    }

    const goals = snapshot.exercise.learningGoals;

    const chatUrl = `${options.baseUrl}/chat/completions`;

    // TODO  consider ok/non-ok?
    const requestData = {
      messages: [
        {
          role: "system",
          content:
            this.prompts.system + goals
              ? `\nHere the learning goals are ${goals?.join(", ")}`
              : "",
        },
        {
          role: "user",
          content: this.buildUserMsg(snapshot),
        },
      ],
      model: options.model ?? "TODO default model",
    };

    // Request to url
    const r = await fetch(chatUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    // JSON format.
    const txt = (await r.json()).choices[0].message.content;

    if (typeof txt !== "string") {
      throw new Error("weird message content: " + typeof txt);
    }
    // validate response?

    return { summary: txt };
  }

  /**
   * Piece together a message to the AI
   */
  private buildUserMsg(snapshot: EvaluationSnapshot): string {
    return (
      "\nHere is the output of the python interpreter:\n" +
      snapshot.result.stdout +
      "\n" +
      snapshot.result.stderr +
      "\n" +
      this.prompts.pre_source +
      "\n" +
      snapshot.source +
      "\n" +
      this.prompts.post_source
    );
  }

  isAvailable(): boolean {
    throw new Error("Method not implemented.");
  }

  /**
   * Check which models are available
   * @returns TODO clean up types
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

    return await resp.json();
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
