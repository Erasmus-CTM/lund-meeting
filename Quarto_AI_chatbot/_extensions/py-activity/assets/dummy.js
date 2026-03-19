console.log("Hello from dummy script");

/**
 * Show that we can render things client side.
 */
function mountDebugWidget() {
  const activities = Array.from(document.querySelectorAll(".activity"));
  const count = activities.length;

  const el = document.createElement("div");
  el.id = "activity-debug";
  el.textContent = `🐞 ${count} activit${count === 1 ? "y" : "ies"}`;

  // Click to show more info
  el.addEventListener("click", () => {
    if (activities.length) {
      alert(
        "Activities:\n" +
          activities
            .map(
              (e) =>
                "  " +
                e.getAttribute("data-activity-id") +
                " | attrs=" +
                // parse and stringify...
                JSON.stringify(JSON.parse(e.getAttribute("data-config")))
            )
            .join("\n")
      );
    } else {
      alert("No activities detected");
    }
  });

  document.body.appendChild(el);
}

document.addEventListener("DOMContentLoaded", () => {
  mountDebugWidget();
});
