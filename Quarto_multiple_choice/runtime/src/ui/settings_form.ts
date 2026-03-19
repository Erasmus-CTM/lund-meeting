import type { SettingsStorage } from "../storage/settings_storage";

/**
 * Reads form data and puts in Store, prefills form eith loaded data.
 * Make form in HTML first!
 */
export class SettingsForm {
  constructor(
    private readonly root: HTMLFormElement,
    private readonly store: SettingsStorage,
  ) {
    this.prefill();
    this.bind();
  }

  private bind() {
    this.root.addEventListener("submit", (e) => {
      // avoid default HTTP action
      e.preventDefault();
      this.saveFromForm();
    });
  }

  private prefill() {
    const settings = this.store.load();
    if (!settings) return;

    this.setValue("apiKey", settings.apiKey);
    this.setValue("baseUrl", settings.baseUrl);
    this.setValue("model", settings.model);
  }

  /**
   * Read form data.
   */
  private saveFromForm() {
    const data = new FormData(this.root);

    this.store.save({
      apiKey: data.get("apiKey") as string | undefined,
      baseUrl: data.get("baseUrl") as string,
      model: data.get("model") as string | undefined,
    });
  }

  private setValue(name: string, value?: string) {
    const el = this.root.elements.namedItem(name) as HTMLInputElement | null;

    if (el && value !== undefined) {
      el.value = value;
    }
  }
}
