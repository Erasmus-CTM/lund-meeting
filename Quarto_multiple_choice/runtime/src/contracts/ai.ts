/**
 * What does the api say about its models
 * (at least two providers i've tried)
 */
export interface ModelMeta {
  id: string;
  created: number; // timestamp
  object: string;
  owned_by: string;
}
/**
 * What should the AI give us?
 */
export interface AIFeedback {
  summary: string;

  /** Structured output could be interesting... */
  hints?: string[];
}

/**
 * This is user specific (student's own API-key)
 * Consider API-key sensitive and only keep in memory/localstorage.
 */
export interface AICredentials {
  baseUrl: string;
  apiKey?: string;
  model?: string;
}

/**
 * Wraps communication with AI and formatting of requests and responses.
 */
export interface AIFeedbackProvider {
  generate(
    prompt: string,
    creds: AICredentials,
    history: ChatTurn[],
    learningGoals: string[] | undefined,
    userQuery: string | undefined,
  ): Promise<AIFeedback>;

  isAvailable(): boolean;
  ping(options: AICredentials): Promise<string>;

  models(opts: AICredentials): Promise<ModelMeta[]>;
}

/**
 * DEPRECATED What content should be inserted in the prompt
 */
export interface PromptSetup {
  system: string;
  pre_source: string;
  post_source: string;
}

/**
 * We can include a list of previous messages for better context
 * when getting multiple feedbacks.
 */
export interface ChatTurn {
  role: "user" | "assistant" | "system";
  content: string;
  // maybe this can be a short string about the query that generated the feedback:
  causedBy?: string;
}
