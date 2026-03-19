import "./styles/main.css";

import { SettingsStorage } from "./storage/settings_storage";
import { SettingsForm } from "./ui/settings_form";
import { getGlobalOptions, hydrateActivities } from "./setup";
import { DebugWidget } from "./ui/debug_widget";
import { HttpAIProvider } from "./ai/http_ai_provider";
import { hydrateDebugButtons } from "./ui/demo_debug_buttons";
import { ActStorageLs } from "./storage/act_storage_ls";

function init() {
  console.log("HELLO MAIN");

  // load document options
  const globalOptions = getGlobalOptions();
  console.log("global options", globalOptions);
  const sysPrompt = globalOptions.prompts.system;
  if (!sysPrompt) console.error("No system prompt!");

  const aipr = new HttpAIProvider(sysPrompt ?? "system prompt");
  const btnPing = document.querySelector<HTMLButtonElement>("#btn-ping");
  const btnModels = document.querySelector<HTMLButtonElement>("#btn-models");

  // Ai settings ui and store
  const settings = new SettingsStorage();
  const formEl = document.querySelector<HTMLFormElement>("#settings-form");
  if (!formEl) throw new Error("missing settings form");
  new SettingsForm(formEl, settings);

  // activity persistence
  const actStorage = new ActStorageLs();

  if (btnPing && btnModels) {
    hydrateDebugButtons(btnPing, btnModels, settings, aipr);
  } else {
    console.warn("Some debugging button is missing");
  }

  // setup interactive activitiyes
  const actCollection = hydrateActivities(
    document.querySelectorAll(".activity"),
    aipr,
    settings,
    actStorage,
    globalOptions.prompts,
  );

  // mount debug widget
  document.body.appendChild(
    DebugWidget({
      activities: actCollection.activitities.map((a) => a.meta),
      rawPrompts: globalOptions.prompts,
    }),
  );
}
// runs after quarto generated content is loaded (at least most of it?)
document.addEventListener("DOMContentLoaded", init);
