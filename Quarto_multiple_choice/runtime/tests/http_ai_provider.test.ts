import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { HttpAIProvider } from "../src/ai/http_ai_provider";
import { AICredentials } from "../src/contracts/ai";

const dummyCred: AICredentials = {
  baseUrl: "/fake.ai/v1",
  apiKey: "secret!",
  model: "trash",
};

beforeEach(() => {
  // Mock the fetch to somewhat resemble OpenAI-api
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) => {
      // ---- Chat completion endpoint ----
      if (url.includes("/chat") || url.includes("/completions")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: "chatcmpl-test123",
            object: "chat.completion",
            created: Date.now(),
            model: "gpt-4o-mini",
            choices: [
              {
                index: 0,
                message: {
                  role: "assistant",
                  content: "Hello from mocked model",
                },
                finish_reason: "stop",
              },
            ],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 5,
              total_tokens: 15,
            },
          }),
        } as Response;
      }

      // ---- Models endpoint ----
      if (url.includes("/models")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            object: "list",
            data: [
              {
                id: "gpt-dummy",
                object: "model",
                created: 1700000000,
                owned_by: "dummy",
              },
              {
                id: "gemma-dummy",
                object: "model",
                created: 1700000001,
                owned_by: "dummy",
              },
            ],
          }),
        } as Response;
      }

      // avoid unknown cases
      throw new Error(`Unhandled fetch call: ${url}`);
    }),
  );
});

afterEach(() => {
  // Clean up global mocks
  vi.unstubAllGlobals();
});
test("list models", async () => {
  const provider = new HttpAIProvider("SYSPROMPT");

  const models = await provider.models(dummyCred);

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(models.length).toBe(2);
});

test("feedback", async () => {
  const provider = new HttpAIProvider("SYSPROMPT");

  const fdbk = await provider.generate("whats up?", dummyCred);
  expect(fetch).toHaveBeenCalledTimes(1);

  expect(fetch).toHaveBeenCalledWith(
    dummyCred.baseUrl + "/chat/completions",
    expect.objectContaining({
      headers: {
        Authorization: "Bearer " + dummyCred.apiKey,
        "Content-Type": "application/json",
      },
    }),
  );

  // Look at sent messages
  const [, options] = (fetch as any).mock.calls[0];
  const body = JSON.parse(options.body);

  expect(body.messages).toHaveLength(2);
  expect(body.messages).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ role: "system", content: "SYSPROMPT" }),
      expect.objectContaining({ role: "user", content: "whats up?" }),
    ]),
  );
  expect(body.model).toBe(dummyCred.model);

  // Returns string
  expect(typeof fdbk.summary).toBe("string");
});

test("feedback with history", async () => {
  const provider = new HttpAIProvider("SYSPROMPT");

  const fdbk = await provider.generate("whats up?", dummyCred, [
    {
      role: "user",
      content: "old question",
    },
    {
      role: "assistant",
      content: "old reply",
    },
  ]);
  expect(fetch).toHaveBeenCalledTimes(1);

  // Look at sent messages
  const [, options] = (fetch as any).mock.calls[0];
  const body = JSON.parse(options.body);

  expect(body.messages).toHaveLength(4);
  expect(body.messages).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ role: "system", content: "SYSPROMPT" }),
      expect.objectContaining({ role: "user", content: "whats up?" }),
      expect.objectContaining({ content: "old reply" }),
      expect.objectContaining({ content: "old question" }),
    ]),
  );
  expect(body.model).toBe(dummyCred.model);

  // Returns string
  expect(typeof fdbk.summary).toBe("string");
});
