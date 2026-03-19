import { describe, expect, test } from "vitest";

import {
  ChoiceMeta,
  isActivityType,
  TextMeta,
} from "../src/contracts/activity";
import { parseActivityMeta, createController } from "../src/setup";
import { DummyFeedbackProvider } from "../src/ai/dummy_feedback_provider";

import { ControllerContext } from "../src/contracts/activity";

import { SettingsStorage } from "../src/storage/settings_storage";
import { ActStorageLs } from "../src/storage/act_storage_ls";

describe("activity types", () => {
  test("is not activity type", () => {
    expect(isActivityType("trash123")).toBe(false);
  });
  test("is activity type", () => {
    expect(isActivityType("choice")).toBe(true);
  });
});

describe("extract activity meta", () => {
  // ---------- Happy paths ----------

  test("parses valid choice activity", () => {
    const raw = {
      id: "12a",
      type: "choice",
      question_md: "Q?",
      correct: "A",
      options_md: ["A", "B"],
    };

    const result = parseActivityMeta(raw) as ChoiceMeta;

    expect(result.type).toBe("choice");
    expect(result.id).toBe("12a");
    expect(result.options_md).toBeDefined();
    expect(result.correct).toBeDefined();
  });

  test("parses valid text activity with ai grading", () => {
    const raw = {
      id: 5,
      type: "text",
      question_md: "Explain",
      grading: "ai",
      prompt_key_grading: "text_grading",
    };

    const result = parseActivityMeta(raw) as TextMeta;

    expect(result.type).toBe("text");
    expect(result.grading).toBe("ai");
  });

  test("parses valid text activity with manual grading + correct answer", () => {
    const raw = {
      id: 5,
      type: "text",
      question_md: "Explain",
      grading: "normalized-exact",
      correct: "expected answer",
    };

    const result = parseActivityMeta(raw) as TextMeta;

    expect(result.type).toBe("text");
    expect(result.correct).toBeDefined();
  });

  // ---------- Defaults ----------

  test("applies default prompt_key = type", () => {
    const raw = {
      id: 1,
      type: "choice",
      question_md: "Q",
      correct: "A",
      options_md: ["A", "B"],
    };

    const result = parseActivityMeta(raw);

    expect(result.prompt_key).toBe("choice");
  });

  test("applies default useChatHistory = true", () => {
    const raw = {
      id: 1,
      type: "choice",
      question_md: "Q",
      correct: "A",
      options_md: ["A", "B"],
    };

    const result = parseActivityMeta(raw);

    expect(result.useChatHistory).toBe(true);
  });

  test("respects explicit use_chat_history = false", () => {
    const raw = {
      id: 1,
      type: "choice",
      question_md: "Q",
      correct: "A",
      options_md: ["A", "B"],
      use_chat_history: false,
    };

    const result = parseActivityMeta(raw);

    expect(result.useChatHistory).toBe(false);
  });

  // ---------- Error cases ----------

  test("throws for unsupported activity type", () => {
    const raw = {
      id: 1,
      type: "banana",
      question_md: "Q",
    };

    expect(() => parseActivityMeta(raw)).toThrow();
  });

  test("throws when choice missing correct", () => {
    const raw = {
      id: 1,
      type: "choice",
      question_md: "Q",
      options_md: ["A", "B"],
    };

    expect(() => parseActivityMeta(raw)).toThrow();
  });

  test("throws when choice missing options_md", () => {
    const raw = {
      id: 1,
      type: "choice",
      question_md: "Q",
      correct: "A",
    };

    expect(() => parseActivityMeta(raw)).toThrow();
  });

  test("throws when text missing grading", () => {
    const raw = {
      id: 1,
      type: "text",
      question_md: "Q",
    };

    expect(() => parseActivityMeta(raw)).toThrow();
  });

  test("throws when non-ai text missing correct", () => {
    const raw = {
      id: 1,
      type: "text",
      question_md: "Q",
      grading: "exact",
    };

    expect(() => parseActivityMeta(raw)).toThrow();
  });
});

describe("createController", () => {
  const aipr = new DummyFeedbackProvider();
  const settings = new SettingsStorage();
  const actStore = new ActStorageLs();

  const meta = {
    type: "choice" as const,
    id: "111",
    prompt_key: "a",
    question_md: "what?",
    useChatHistory: false,
    correct: [],
    options_md: [],
  };

  test("can create choice controller", () => {
    const el: HTMLElement = document.createElement("div");
    const ul = document.createElement("ul");
    el.appendChild(ul);
    const rawPrompts: Record<string, string | undefined> = { a: "yo {a}" };

    const context: ControllerContext = {
      el,
      ai: aipr,
      settings: settings,
      storage: actStore,
      rawPrompts,
    };

    const controller = createController(context, meta);

    expect(controller).toBeDefined();
  });
});
