import type { UIComponent } from "../contracts/ui";

/**
 * A Simple box showing an error-message
 */
export const ErrorBox: UIComponent<{ message: string }> = ({ message }) => {
  const el = document.createElement("div");
  el.className = "error-box";
  el.textContent = message;
  return el;
};
