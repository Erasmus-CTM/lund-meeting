import { AiInteractionError } from "../ai/errors";
import type { AIFeedbackProvider } from "../contracts/ai";
import type { SettingsStorage } from "../storage/settings_storage";
import type { LightPyodideProvider } from "../execution/light_pyodide_provider";
import { LoadingFullScreen } from "./loading";

export function hydrateDebugButtons(
  btnPing: HTMLButtonElement,
  btnModels: HTMLButtonElement,
  settings: SettingsStorage,
  aipr: AIFeedbackProvider,
) {
  btnPing.addEventListener("click", async () => {
    console.log("pinging AI...");
    const ld = LoadingFullScreen({ title: "pinging AI" });
    document.body.appendChild(ld);
    const creds = settings.load();

    // do we have AI credentials stored?
    if (!creds) {
      alert("Please enter AI credentials!");
      return;
    }

    try {
      const r = await aipr.ping(creds);
      console.log(r);
    } catch (error) {
      alert(error instanceof AiInteractionError ? error.message : error);
    }
    ld.remove();
  });
  btnModels.addEventListener("click", async () => {
    // do we have AI credentials stored?
    const creds = settings.load();
    if (!creds) {
      alert("Please enter AI credentials!");
      return;
    }

    console.log("asking for models...");
    try {
      const r = await aipr.models(creds);
      console.log(r);
    } catch (error) {
      alert(error instanceof AiInteractionError ? error.message : error);
    }
  });
}

function hydratePyInitDemoBtn(
  btnPy: HTMLButtonElement,
  pypr: LightPyodideProvider,
) {
  btnPy.addEventListener("click", async () => {
    const ld = LoadingFullScreen({ title: "Loading python" });
    document.body.appendChild(ld);

    await pypr.init();
    ld.remove();
  });
}
