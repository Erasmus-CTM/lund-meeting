// <div class="small-box">
//   <p class="small-title">Code output</p>
//   <div class="output-box"></div>
// </div>;

import type { UIComponent } from "../contracts/ui";

/**
 * Cover screen with loading message
 */
export const MessageBox: UIComponent<{
  title: string;
  content: string;
}> = ({ title, content }) => {
  const el = document.createElement("div");
  el.className = "small-box";

  const t = document.createElement("p");
  t.textContent = title;

  const box = document.createElement("div");
  box.className = "output-box";
  box.textContent = content;
  el.replaceChildren(t, box);

  return el;
};
