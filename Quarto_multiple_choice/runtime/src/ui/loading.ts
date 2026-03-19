// <div class="loading-fullscreen" style="display: none">
//   <div class="loader">
//     <div class="spinner"></div>
//     <h1>Loading Python…</h1>
//     <p>This may take a few seconds</p>
//   </div>
// </div>

import type { UIComponent } from "../contracts/ui";

/**
 * Cover screen with loading message
 */
export const LoadingFullScreen: UIComponent<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle = "This may take a few seconds..." }) => {
  const spinner = document.createElement("div");
  spinner.className = "spinner";

  const h = document.createElement("h1");
  h.textContent = title;

  const msg = document.createElement("p");
  msg.textContent = subtitle;

  // visible box
  const box = document.createElement("div");
  box.className = "loader";
  box.replaceChildren(spinner, h, msg);

  // covering element
  const el = document.createElement("div");
  el.replaceChildren(box);
  el.className = "loading-fullscreen";

  return el;
};
