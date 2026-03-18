# Customizations to `coatless-quarto/pyodide`

This document records every change made to the upstream Quarto extension and explains
how to update the extension in the future while preserving them.

---

## 1. Upstream baseline

| Property | Value |
|---|---|
| Extension | [coatless-quarto/pyodide](https://github.com/coatless-quarto/pyodide) |
| Pyodide runtime | 0.25.0 |
| `_extension.yml` version | 0.0.1 |
| Monaco Editor | 0.46.0 |

The upstream is actively maintained; the version captured here is likely **not the
latest**. Before updating, check the current release on GitHub.

---

## 2. What was added / changed

### 2.1 `qpyodide-document-settings.js` — two new global flags

Two lines were appended **at the end** of the file:

```js
/* Set variable for backend
for Groq Server: "groq"
for flask Server: "flask"*/
globalThis.backend = "groq";

/* Set if there should be a button for feedback
with feedback button: true
without feedback button: false */
globalThis.feedback = true;
```

**Purpose:** master switches consumed by the other modified files.
- `backend`: selects the AI provider.
- `feedback`: enables / disables the feedback button on every cell.

---

### 2.2 `qpyodide-document-status.js` — API-key UI

The upstream file only creates the "Python interpreter: loading …" status header.
All additions are **inside** `qpyodideDisplayStartupMessage()`.

**Added blocks (roughly lines 59–184):**

1. Two extra `<div>` containers (`thirdInnerDiv` for Base-URL, `fourthInnerDiv` for API key) appended to the status area.
2. A `<input type="text">` + `<button>` pair for the **API key** (stored in `sessionStorage.groqApiKey`).
3. A `<input type="text">` + `<button>` pair for the **Base URL** (stored in `sessionStorage.baseUrlInput`).
4. A Font Awesome gear icon (`fa-gear`) that toggles visibility of the two input pairs.
5. Helper functions `toggleSettings()` and `checkAndHideSettings()`.
6. A `DOMContentLoaded` listener that restores saved values from `sessionStorage` and hides the fields automatically when both values are present.

**Also added (line 10–12):** inside `qpyodideSetInteractiveButtonState()` the feedback buttons are enabled/disabled together with the run buttons:
```js
document.querySelectorAll(".qpyodide-button-feedback").forEach((btn) => {
    btn.disabled = !enableCodeButton;
});
```

---

### 2.3 `qpyodide-cell-classes.js` — feedback button + AI call

This is the largest modification. Everything is conditional on `globalThis.feedback`.

#### A. Button creation (inside `InteractiveCell.setupElement()`)

After the copy button, a **Feedback button** is created and appended to the toolbar
only when `feedback == true` and the cell is not read-only:

```js
if (globalThis.feedback == true) {
    var feedbackButton = document.createElement('button');
    feedbackButton.className = 'btn btn-default qpyodide-button qpyodide-button-feedback';
    feedbackButton.disabled = true;   // enabled later by qpyodideSetInteractiveButtonState
    feedbackButton.id = `qpyodide-button-feedback-${this.id}`;
    feedbackButton.textContent = "Feedback";
}
// …
if (globalThis.feedback == true && this.options['read-only'] == "false") {
    rightButtonsDiv.appendChild(feedbackButton);
}
```

#### B. Feedback output area (inside `setupElement()`)

A `<div>` for the AI response is inserted below the code output area:

```js
if (globalThis.feedback == true) {
    var outputFeedbackAreaDiv = document.createElement('div');
    outputFeedbackAreaDiv.id = `qpyodide-output-feedback-area-${this.id}`;
    outputFeedbackAreaDiv.className = 'qpyodide-output-feedback-area';
    outputFeedbackAreaDiv.setAttribute('aria-live', 'assertive');
}
```

#### C. `feedbackButton.onclick` handler (the AI call)

The handler is set up inside `setupMonacoEditor()` after the editor is ready.
Rough flow:

1. Read current code from Monaco editor.
2. Execute code via Pyodide to capture stdout/stderr.
3. Assemble a prompt from three parts: system prompt + runtime output + review instructions.
4. Dispatch to the selected backend.

**Groq path** (`globalThis.backend == "groq"`):
- Reads API key and Base URL from the DOM inputs (backed by `sessionStorage`).
- `GET {baseUrl}/models` → picks `"mixtral-8x7b-32768"` or first available model.
- `POST {baseUrl}/chat/completions` with `messages: [{role:"system",…},{role:"user",…}]`.
- Renders `data.choices[0].message.content` into the feedback div (newlines → `<br>`).

**Flask path** (`globalThis.backend == "flask"`):
- Fixed endpoint: `http://127.0.0.1:5000/api/feedback`.
- Same request/response shape as Groq; no auth header.

The same logic is **duplicated** inside `setupNewMonacoEditor()` for dynamically
added code blocks.

---

### 2.4 `qpyodide-styling.css` — feedback area styling

Added at the end of the file:

```css
.qpyodide-output-feedback-area {
  background-color: darksalmon;
  color: black;
}

.qpyodide-output-feedback-area.has-content {
  padding: 10px;
}
```

---

## 3. Files that were NOT changed

| File | Status |
|---|---|
| `qpyodide.lua` | unchanged from upstream |
| `qpyodide-document-engine-initialization.js` | unchanged |
| `qpyodide-cell-initialization.js` | unchanged |
| `qpyodide-monaco-editor-init.html` | unchanged |
| `_extension.yml` | unchanged |

---

## 4. How to update the upstream extension

### Step 1 — fetch the new upstream files

```bash
# In your project root:
quarto add coatless-quarto/pyodide
```

This **overwrites** the entire `_extensions/coatless-quarto/pyodide/` directory.
Say **yes** when prompted to update.

### Step 2 — re-apply the customizations

After updating, re-apply each section from chapter 2 above:

| File to edit | What to re-apply |
|---|---|
| `qpyodide-document-settings.js` | Append the two `globalThis.backend` / `globalThis.feedback` lines (section 2.1). |
| `qpyodide-document-status.js` | (a) Add the `querySelectorAll(".qpyodide-button-feedback")` block inside `qpyodideSetInteractiveButtonState`. (b) Add the third/fourth inner divs + API-key UI inside `qpyodideDisplayStartupMessage` (section 2.2). |
| `qpyodide-cell-classes.js` | Add the feedback button creation + onclick handler in `setupElement()` and `setupMonacoEditor()`, and duplicate in `setupNewMonacoEditor()` (section 2.3). |
| `qpyodide-styling.css` | Append the `.qpyodide-output-feedback-area` rules (section 2.4). |

### Step 3 — check for breaking changes

The most common sources of breakage when updating:

- **Renamed functions or variables** in `qpyodide-cell-classes.js` — search for
  `setupElement`, `setupMonacoEditor`, `setupNewMonacoEditor` in the new file and
  confirm they still exist with the same signatures.
- **Pyodide version bump** — the new `_extension.yml` / Lua filter may point to a
  newer Pyodide CDN URL.  The AI feedback logic itself is version-agnostic.
- **Monaco Editor version bump** in `qpyodide-monaco-editor-init.html` — fine to
  accept as-is.

### Step 4 — test

```bash
quarto preview
```

Verify:
1. Pyodide loads ("🟢 Ready!").
2. Gear icon appears; entering API key + Base URL saves to sessionStorage.
3. "Feedback" button is present and enabled after Pyodide is ready.
4. Clicking Feedback executes the code and displays AI output.

---

## 5. Long-term maintenance tip

Consider keeping this document version-controlled alongside the extension files.
Before any update, record the upstream commit hash or release tag that was used as
the baseline so the diff in step 2 can be produced mechanically if needed:

```bash
# record upstream version
cat _extensions/coatless-quarto/pyodide/_extension.yml
```
