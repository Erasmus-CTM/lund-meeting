// Utilities for setting up the interactive document

import {
  isActivityType,
  type Activity,
  type ActivityCollection,
  type AnyActivityMeta,
  type ControllerContext,
} from "./contracts/activity";
import { BaseActivityController } from "./controller/base_activity_controller";
import type { AIFeedbackProvider } from "./contracts/ai";
import type { GlobalOptions } from "./contracts/global_options";
import type { ActStorage } from "./contracts/storage";
import { ChoiceController } from "./controller/choice_controller";
import { TextController } from "./controller/text_controller";
import type { SettingsStorage } from "./storage/settings_storage";

/**
 * Load global options (JSON) from a script tag
 * @returns
 */
export function getGlobalOptions(): GlobalOptions {
  const el = document.querySelector("#global-options");
  if (!el) {
    throw new Error("Could not find global-options element");
  }
  const data = JSON.parse(el.textContent);

  // A small validation
  if (!data.prompts) {
    throw new Error("prompts missing from global options");
  }
  return data;
}

/**
 * Extract metadata for the activity
 * @param el Root element for the activity
 */
export function parseActivityMeta(raw: any): AnyActivityMeta {
  const actId = raw.id;
  const actType = raw.type;
  if (!actId) throw new Error("missing actId");

  if (!isActivityType(actType)) {
    throw new Error(`Activity ${actId}: bad activity type: '${actType}'`);
  }
  // Activity type specific metadata validation
  if (actType == "choice") {
    if (!raw.correct) throw new Error("Choice meta missing correct");
    if (!raw.options_md) throw new Error("Choice meta missing options_md");
  } else if (actType == "text") {
    if (!raw.grading) throw new Error("Text meta missing 'grading'");
    if (raw.grading != "ai" && !raw.correct) {
      throw new Error("Text: non-ai grading needs 'correct'");
    }
    if (raw.grading == "ai" && !raw.prompt_key_grading) {
      throw new Error("Text: ai grading needs 'prompt_key_grading'");
    }
  }

  return {
    id: actId,
    type: actType,
    prompt_key: raw?.prompt_key ?? actType,
    question_md: raw.question_md,
    useChatHistory: raw.use_chat_history ?? true,
    // activity specific:
    options_md: raw.options_md,
    correct: raw.correct,
    grading: raw.grading,
    prompt_key_grading: raw.prompt_key_grading,
  };
}

/**
 * Initialize each activity with UI+Controller
 */
export function hydrateActivities(
  elements: Iterable<HTMLElement>,
  ai: AIFeedbackProvider,
  settings: SettingsStorage,
  actStorage: ActStorage,
  rawPrompts: Record<string, string | undefined>,
): ActivityCollection {
  const acts: Activity[] = [];
  for (const el of elements) {
    try {
      // load ALL metadata from json
      const jsonEl = el.querySelector<HTMLScriptElement>(
        "script.activity-meta",
      );
      if (!jsonEl) throw new Error("Missing script.activity-meta");
      const meta = parseActivityMeta(JSON.parse(jsonEl.textContent));
      const cont = createController(
        {
          el: el,
          ai: ai,
          settings: settings,
          storage: actStorage,
          rawPrompts: rawPrompts,
        },
        meta,
      );

      cont.init();

      acts.push({
        meta: meta,
        controller: cont,
      });
    } catch (error) {
      console.error(error);
      // clearly indicate something is wrong with the activity
      el.classList.add("debug-error");
    }
  }
  return {
    activitities: acts,
  };
}

/**
 * Factory for activity controller
 * @param el root element of activity
 * @param meta
 * @returns Controller object
 */
export function createController(
  ctx: ControllerContext,
  meta: AnyActivityMeta,
): BaseActivityController {
  const prompt = ctx.rawPrompts[meta.prompt_key];
  if (!prompt) {
    throw new Error("prompt template not found:" + meta.prompt_key);
  }

  switch (meta.type) {
    case "choice":
      return new ChoiceController(ctx, meta, prompt);
    case "text":
      // maybe a prompt for grading...
      const grdPrompt = ctx.rawPrompts[meta.prompt_key_grading ?? ""] ?? null;
      return new TextController(ctx, meta, prompt, grdPrompt);

    default:
      // shouldnt happen!
      throw new Error(`unsupported activity type: ${(meta as any).type}`);
  }
}

// Actually, quarto might do some CSR (for example hidden tabs, reveal)
// so we might need to wait for that before hydrating
// something like this? (verify it actually uses these events)
// function hydrateAll() {
//   const els = document.querySelectorAll<HTMLElement>(
//     "[data-config]:not([data-hydrated])",
//   );
//   hydrateActivities(els);
// }
// document.addEventListener("DOMContentLoaded", hydrateAll);
// document.addEventListener("quarto:after-render", hydrateAll);
