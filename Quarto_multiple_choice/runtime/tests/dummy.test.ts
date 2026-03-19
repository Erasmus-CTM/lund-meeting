import { describe, expect, test } from "vitest";

import { DummyFeedbackProvider } from "../src/ai/dummy_feedback_provider";

describe("dummy feedback", () => {
  test("is available", () => {
    const fpr = new DummyFeedbackProvider();
    expect(fpr.isAvailable()).toBe(true);
  });

  test("can generate", async () => {
    const fpr = new DummyFeedbackProvider();
    const fdbk = await fpr.generate("hello");
    expect(fdbk.summary).toContain("hello");
  });
});
