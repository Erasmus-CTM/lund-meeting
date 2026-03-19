export class AiInteractionError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly kind?: "auth" | "network" | "ssl" | "server",
  ) {
    super(message);
    this.name = "AIInteractionError";
  }

  static classifyNetworkError(
    err: unknown,
    baseUrl: string,
  ): AiInteractionError {
    if (baseUrl.startsWith("https://")) {
      return new AiInteractionError(
        "Could not connect to the AI server. If this is a local server, try using http:// instead of https://.",
        err,
        "ssl",
      );
    }

    return new AiInteractionError(
      "Could not connect to the AI server. Please check the server URL and your network connection.",
      err,
      "network",
    );
  }
  static classifyHttpError(resp: Response): AiInteractionError {
    switch (resp.status) {
      case 401:
        return new AiInteractionError(
          "Authentication failed. Please check your API key.",
          resp,
          "auth",
        );
      case 403:
        return new AiInteractionError(
          "The API key does not have access to this resource.",
          resp,
          "auth",
        );
      default:
        return new AiInteractionError(
          `AI server returned ${resp.status} ${resp.statusText}.`,
          resp,
          "server",
        );
    }
  }
}
