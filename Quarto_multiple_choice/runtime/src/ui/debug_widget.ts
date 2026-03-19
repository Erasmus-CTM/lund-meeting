import type { BaseActivityMeta } from "../contracts/activity";
import type { UIComponent } from "../contracts/ui";

/**
 * Small widget floating in corner. Shows detected interactive activities.
 */
export const DebugWidget: UIComponent<{
  activities: BaseActivityMeta[];
  rawPrompts: Record<string, string | undefined>;
}> = ({ activities, rawPrompts }) => {
  const count = activities.length;
  console.log("making debug widget for: " + count);

  const root = document.createElement("div");
  root.id = "activity-debug";

  const actsEl = document.createElement("div");
  actsEl.textContent = `🐞 ${count} activit${count === 1 ? "y" : "ies"}`;

  // Click to show more info
  actsEl.addEventListener("click", () => {
    if (activities.length) {
      alert(
        "Activities:\n" +
          activities.map((a) => `${a.id}: ${a.type}`).join("\n"),
      );
    } else {
      alert("No activities detected");
    }
  });

  const promptsEl = document.createElement("div");
  const promptCount = Object.keys(rawPrompts).length;
  promptsEl.textContent = `${promptCount} prompts`;
  // Click to show more info
  promptsEl.addEventListener("click", () => {
    if (promptCount) {
      alert(
        "Prompts:\n" +
          Object.keys(rawPrompts)
            .map((k) => `${k}: ${rawPrompts[k]}`)
            .join("\n\n"),
      );
    } else {
      alert("No prompts detected");
    }
  });

  root.replaceChildren(actsEl, promptsEl);

  return root;
};
