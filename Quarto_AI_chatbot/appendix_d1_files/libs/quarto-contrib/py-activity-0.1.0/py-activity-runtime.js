class ae {
  constructor(e, s) {
    this.el = e, this.meta = s;
  }
  async submit() {
    throw new Error("Method not implemented.");
  }
  mount() {
    this.el.querySelectorAll("button").forEach((s) => s.addEventListener("click", this.onClick));
  }
  // maybe??
  onClick = (e) => {
  };
}
const G = {
  // code: CodeActivityController,
  choice: ae
  //   cloze: ClozeActivityController,
};
function V(r) {
  return r !== null && r in G;
}
function ce(r, e) {
  if (!V(e.type))
    throw new Error(`unsupported activity type: ${e.type}`);
  const s = G[e.type];
  return new s(r, e);
}
function ie() {
  const r = document.querySelector("#global-options");
  if (!r)
    throw new Error("Could not find global-options element");
  const e = JSON.parse(r.textContent);
  if (!e.prompts)
    throw new Error("prompts missing from global options");
  return e;
}
function le(r) {
  const e = r.getAttribute("data-act-id"), s = r.getAttribute("data-act-type");
  if (!e) throw new Error("missing activity id");
  if (!V(s))
    throw new Error("unsupported activity type: " + s);
  return {
    id: Number(e),
    type: s
  };
}
function de(r) {
  const e = [];
  for (const s of r)
    try {
      const n = le(s);
      e.push({
        meta: n,
        controller: ce(s, n)
      });
    } catch (n) {
      console.error(n), s.classList.add("debug-error");
    }
  return {
    activitities: e
  };
}
const he = ({ activities: r }) => {
  const e = r.length;
  console.log("making debug widget for: " + e);
  const s = document.createElement("div");
  return s.id = "activity-debug", s.textContent = `🐞 ${e} activit${e === 1 ? "y" : "ies"}`, s.addEventListener("click", () => {
    r.length ? alert(
      `Activities:
` + r.map((n) => `${n.id}| ${n.type}`).join(`
`)
    ) : alert("No activities detected");
  }), s;
};
class b extends Error {
  constructor(e, s, n) {
    super(e), this.cause = s, this.kind = n, this.name = "AIInteractionError";
  }
  static classifyNetworkError(e, s) {
    return s.startsWith("https://") ? new b(
      "Could not connect to the AI server. If this is a local server, try using http:// instead of https://.",
      e,
      "ssl"
    ) : new b(
      "Could not connect to the AI server. Please check the server URL and your network connection.",
      e,
      "network"
    );
  }
  static classifyHttpError(e) {
    switch (e.status) {
      case 401:
        return new b(
          "Authentication failed. Please check your API key.",
          e,
          "auth"
        );
      case 403:
        return new b(
          "The API key does not have access to this resource.",
          e,
          "auth"
        );
      default:
        return new b(
          `AI server returned ${e.status} ${e.statusText}.`,
          e,
          "server"
        );
    }
  }
}
const me = ({
  aiProvider: r,
  settingsStore: e,
  prompts: s,
  documentContext: n
}) => {
  const y = (t) => {
    const a = [], u = [];
    let c = t.replace(/```(\w+)?\n([\s\S]*?)```/g, (l) => (a.push(l), `\0CODEBLOCK${a.length - 1}\0`));
    c = c.replace(/`([^`]+)`/g, (l) => (u.push(l), `\0INLINECODE${u.length - 1}\0`));
    let o = c.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return o = o.replace(/\$\$([\s\S]*?)\$\$/g, "$$$$1$$"), o = o.replace(/\$([^$\n]+?)\$/g, "$$1$"), o = o.replace(/^### (.+)$/gm, "<h3>$1</h3>"), o = o.replace(/^## (.+)$/gm, "<h2>$1</h2>"), o = o.replace(/^# (.+)$/gm, "<h1>$1</h1>"), o = o.replace(/^(\d+)\. (.+)$/gm, '<li value="$1">$2</li>'), o = o.replace(/(<li[^>]*>.*<\/li>\n?)+/g, "<ol>$&</ol>"), o = o.replace(/^[-*] (.+)$/gm, "<li>$1</li>"), o = o.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>"), o = o.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"), o = o.replace(/__(.+?)__/g, "<strong>$1</strong>"), o = o.replace(/\*(.+?)\*/g, "<em>$1</em>"), o = o.replace(/_(.+?)_/g, "<em>$1</em>"), o = o.replace(/\n/g, "<br>"), o = o.replace(/\x00INLINECODE(\d+)\x00/g, (l, v) => `<code>${u[parseInt(v)].slice(1, -1).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`), o = o.replace(/\x00CODEBLOCK(\d+)\x00/g, (l, v) => {
      const d = a[parseInt(v)], C = d.match(/```(\w+)?\n([\s\S]*?)```/);
      return C ? (C[1], `<pre><code>${C[2].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`) : d;
    }), o;
  }, m = (t) => {
    if (!n) return `Cell ${t}`;
    const a = n.split(`
`);
    let u = `Cell ${t}`;
    for (let c = 0; c < a.length; c++) {
      const o = a[c], l = o.match(/^(Exercise|Example|Remark)\s+(D\.\d+)/);
      l && (u = `${l[1]} ${l[2]}`), o.includes("```") && c < a.length - 1;
    }
    return u;
  }, i = () => {
    const t = window.monaco;
    if (!t?.editor)
      return console.warn("Monaco not yet loaded, skipping code collection"), "";
    const a = t.editor.getEditors();
    if (!a || a.length === 0)
      return "";
    const u = [];
    return a.forEach((c) => {
      const o = c.getValue(), l = c.__qpyodideinitialCode, v = c.__qpyodideCounter;
      if (o !== l && o.trim() !== "") {
        const d = m(v);
        u.push(`${d}:
\`\`\`python
${o}
\`\`\``);
      }
    }), u.length > 0 ? `

Modified Code:
` + u.join(`

`) : "";
  }, x = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
  </svg>`, g = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>`, $ = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>`, R = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="animation: spin 1s linear infinite;">
    <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"></circle>
  </svg>`, w = document.createElement("button");
  w.id = "chat-bubble", w.className = "chat-bubble", w.innerHTML = x, w.setAttribute("aria-label", "Open chat");
  const f = document.createElement("div");
  f.id = "chat-box", f.className = "chat-box";
  const S = document.createElement("div");
  S.className = "chat-resize-handle", S.setAttribute("title", "Drag to resize"), f.appendChild(S);
  let H = !1, D = 0, B = 0, z = 0, K = 0;
  S.addEventListener("mousedown", (t) => {
    H = !0, D = t.clientX, B = t.clientY, z = f.offsetWidth, K = f.offsetHeight, t.preventDefault(), t.stopPropagation();
  }), document.addEventListener("mousemove", (t) => {
    if (!H) return;
    const a = D - t.clientX, u = B - t.clientY, c = Math.min(Math.max(z + a, 280), 600), o = Math.min(Math.max(K + u, 300), window.innerHeight * 0.8);
    f.style.width = `${c}px`, f.style.height = `${o}px`;
  }), document.addEventListener("mouseup", () => {
    H = !1;
  });
  const L = document.createElement("div");
  L.className = "chat-header";
  const P = document.createElement("span");
  P.className = "chat-title", P.textContent = "AI Assistant";
  const M = document.createElement("div");
  M.className = "chat-header-actions";
  const E = document.createElement("button");
  E.className = "chat-config-btn", E.textContent = "Configure AI", E.style.display = "none";
  const T = document.createElement("button");
  T.className = "chat-close", T.innerHTML = g, T.setAttribute("aria-label", "Close chat"), M.appendChild(E), M.appendChild(T), L.appendChild(P), L.appendChild(M);
  const h = document.createElement("div");
  h.className = "chat-messages";
  const U = document.createElement("div");
  U.className = "chat-message chat-message-bot", U.textContent = "Hello! I'm your AI tutor for mathematical analysis. Ask me about sequences, series, partial sums, or how the Python code relates to the mathematical concepts!", h.appendChild(U);
  const I = document.createElement("div");
  I.className = "chat-input-area";
  const p = document.createElement("textarea");
  p.className = "chat-input", p.placeholder = "Type a message...", p.rows = 1, p.style.resize = "none", p.style.overflow = "hidden";
  const Q = () => {
    p.style.height = "auto", p.style.height = Math.min(p.scrollHeight, 120) + "px";
  };
  p.addEventListener("input", Q);
  const k = document.createElement("button");
  k.className = "chat-send", k.innerHTML = $, k.setAttribute("aria-label", "Send message"), I.appendChild(p), I.appendChild(k), f.appendChild(L), f.appendChild(h), f.appendChild(I);
  const O = document.createElement("div");
  O.id = "chat-container", O.appendChild(w), O.appendChild(f);
  const N = [];
  let j = "", Z = null;
  const ee = () => {
    const t = e.load();
    return !!(t?.apiKey && t?.baseUrl);
  }, te = () => {
    if (ee())
      E.style.display = "none";
    else {
      E.style.display = "inline-block";
      const t = document.createElement("div");
      t.className = "chat-message chat-message-error", t.innerHTML = "⚠️ AI not configured. Click 'Configure AI' to set up your API key.", h.appendChild(t);
    }
  };
  let A = !1;
  const _ = () => {
    A = !A, f.classList.toggle("chat-box-open", A), w.classList.toggle("chat-bubble-hidden", A), A && (p.focus(), h.children.length <= 1 && te());
  }, oe = () => {
    const t = document.querySelector("#ai-settings-form");
    if (t) {
      t.scrollIntoView({ behavior: "smooth", block: "center" });
      const a = t.closest(".callout");
      a && a.classList.remove("callout-collapsed");
    }
    _();
  };
  w.addEventListener("click", _), T.addEventListener("click", _), E.addEventListener("click", oe);
  const se = () => {
    const t = document.createElement("div");
    t.className = "chat-message chat-message-loading", t.innerHTML = `${R} <span>Thinking...</span>`, t.id = "chat-loading-indicator", h.appendChild(t), h.scrollTop = h.scrollHeight;
  }, q = () => {
    const t = document.getElementById("chat-loading-indicator");
    t && t.remove();
  }, ne = (t) => {
    const a = document.createElement("div");
    a.className = "chat-message chat-message-error", a.textContent = t, h.appendChild(a), h.scrollTop = h.scrollHeight;
  }, re = () => N.length === 0 ? "" : `

Previous Conversation:
${N.map((a) => `${a.role === "user" ? "Student" : "AI"}: ${a.content}`).join(`

`)}`, W = async (t, a = !1) => {
    const u = e.load();
    if (!u?.apiKey) {
      ne("Please configure your AI settings. Click the 'Configure AI' button in the chat header.");
      return;
    }
    se();
    try {
      const c = i(), o = re();
      let l = t;
      n && n.length > 0 && (l = `${s.chat_pre_context || "The student is working through course material and asks:"}

Document Context:
${n}${c}${o}

${s.chat_post_context || "Provide a helpful response:"}

Student Question: ${t}`), console.log("=== AI CHAT CONTEXT ==="), console.log("User Question:", t), console.log("System Prompt:", s.chat_system || s.system || "NOT SET"), console.log("Pre-Context:", s.chat_pre_context || "NOT SET"), console.log("Post-Context:", s.chat_post_context || "NOT SET"), console.log("Document Context Length:", n?.length || 0), console.log("Modified Code Section:", c || "(none)"), console.log("Chat History:", N), console.log("History Context:", o || "(none)"), console.log("Full Message:", l), console.log("=======================");
      const v = {
        exercise: {
          id: 0,
          type: "code",
          learningGoals: void 0
        },
        source: l,
        result: {
          stdout: "",
          stderr: "",
          ok: !0,
          durationMs: 0
        }
      }, d = await r.generate(v, u);
      q(), N.push({ role: "user", content: t });
      const C = document.createElement("div");
      if (C.className = "chat-message chat-message-bot", C.innerHTML = y(d.summary), h.appendChild(C), h.scrollTop = h.scrollHeight, N.push({ role: "assistant", content: d.summary }), Z = C, window.MathJax)
        try {
          window.MathJax.typesetPromise([C]);
        } catch (F) {
          console.log("MathJax typesetting failed:", F);
        }
    } catch (c) {
      q(), a || (j = t);
      let o = "";
      c instanceof b ? o = `Connection failed: ${c.message}` : c instanceof Error ? c.message.includes("401") || c.message.includes("Unauthorized") ? o = "Authentication failed: Invalid API key. Please check your OpenRouter key and try again." : c.message.includes("429") ? o = "Rate limit exceeded: Too many requests. Please wait a moment and try again." : c.message.includes("NetworkError") || c.message.includes("fetch") ? o = "Connection failed: Unable to reach OpenRouter. Please check your internet connection." : o = `Error: ${c.message}` : o = `An unexpected error occurred: ${String(c)}`;
      const l = document.createElement("div");
      l.className = "chat-message chat-message-error";
      const v = document.createElement("div");
      v.textContent = o, l.appendChild(v);
      const d = document.createElement("button");
      d.className = "chat-retry-btn", d.textContent = "↻ Try Again", d.style.marginTop = "8px", d.style.padding = "4px 12px", d.style.background = "#fff", d.style.border = "1px solid #dc2626", d.style.borderRadius = "4px", d.style.color = "#dc2626", d.style.cursor = "pointer", d.style.fontSize = "13px", d.onclick = () => {
        l.remove(), W(j, !0);
      }, l.appendChild(d), h.appendChild(l), h.scrollTop = h.scrollHeight;
    }
  };
  return k.addEventListener("click", () => {
    const t = p.value.trim();
    if (t) {
      const a = document.createElement("div");
      a.className = "chat-message chat-message-user", a.textContent = t, h.appendChild(a), p.value = "", p.style.height = "auto", h.scrollTop = h.scrollHeight, W(t);
    }
  }), p.addEventListener("keydown", (t) => {
    t.key === "Enter" && !t.shiftKey && (t.preventDefault(), k.click());
  }), document.addEventListener("keydown", (t) => {
    t.key === "Escape" && A && _();
  }), O;
};
class ue {
  STORAGE_KEY = "settings.ai";
  load() {
    const e = localStorage.getItem(this.STORAGE_KEY);
    if (!e) return null;
    try {
      return JSON.parse(e);
    } catch {
      return null;
    }
  }
  save(e) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(e));
  }
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
class pe {
  constructor(e, s) {
    this.root = e, this.store = s, this.prefill(), this.bind();
  }
  bind() {
    this.root.addEventListener("submit", (e) => {
      e.preventDefault(), this.saveFromForm();
    });
  }
  prefill() {
    const e = this.store.load();
    e && (this.setValue("apiKey", e.apiKey), this.setValue("baseUrl", e.baseUrl), this.setValue("model", e.model));
  }
  /**
   * Read form data.
   */
  saveFromForm() {
    const e = new FormData(this.root);
    this.store.save({
      apiKey: e.get("apiKey"),
      baseUrl: e.get("baseUrl"),
      model: e.get("model")
    });
  }
  setValue(e, s) {
    const n = this.root.elements.namedItem(e);
    n && s !== void 0 && (n.value = s);
  }
}
class J {
  //   prompts = {
  //     system: "You are ...",
  //     pre_source: "Review ...",
  //     post_source: "Your feedback ...",
  //   };
  constructor(e) {
    this.prompts = e, console.log(
      "hello, im a ai provider with prompots: " + JSON.stringify(Object.keys(e))
    );
  }
  /**
   * TODO: completions vs responses API?
   * @param snapshot The context needed from exercise submission/execution
   */
  async generate(e, s) {
    s.model || console.warn("TODO default model choice?");
    const n = e.exercise.learningGoals, y = `${s.baseUrl}/chat/completions`, m = e.exercise.id === 0 && e.exercise.type === "code", i = m && this.prompts.chat_system ? this.prompts.chat_system : this.prompts.system, x = m && this.prompts.chat_pre_context ? this.prompts.chat_pre_context : this.prompts.pre_source, g = m && this.prompts.chat_post_context ? this.prompts.chat_post_context : this.prompts.post_source, $ = {
      messages: [
        {
          role: "system",
          content: i + (n && !m ? `
Here the learning goals are ${n?.join(", ")}` : "")
        },
        {
          role: "user",
          content: this.buildUserMsg(e, x, g)
        }
      ],
      model: s.model ?? "TODO default model"
    }, w = (await (await fetch(y, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${s.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify($)
    })).json()).choices[0].message.content;
    if (typeof w != "string")
      throw new Error("weird message content: " + typeof w);
    return { summary: w };
  }
  /**
   * Piece together a message to the AI
   */
  buildUserMsg(e, s, n) {
    const y = s || this.prompts.pre_source, m = n || this.prompts.post_source;
    return e.exercise.id === 0 ? y + `
` + e.source + `
` + m : `
Here is the output of the python interpreter:
` + e.result.stdout + `
` + e.result.stderr + `
` + y + `
` + e.source + `
` + m;
  }
  isAvailable() {
    throw new Error("Method not implemented.");
  }
  /**
   * Check which models are available
   * @returns TODO clean up types
   */
  async models(e) {
    const s = `${e.baseUrl}/models`;
    let n;
    try {
      n = await fetch(s, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${e.apiKey}`,
          "Content-Type": "application/json"
        }
      });
    } catch (y) {
      throw b.classifyNetworkError(y, e.baseUrl);
    }
    if (!n.ok)
      throw b.classifyHttpError(n);
    return await n.json();
  }
  /**
   * Send a test message to the AI
   */
  async ping(e) {
    const s = `${e.baseUrl}/chat/completions`, n = e.model;
    if (!n) throw new Error("Choose a model!");
    const y = {
      messages: [
        {
          role: "system",
          content: "You are a programming teacher, giving short answers."
        },
        {
          role: "user",
          content: "Answer in 2 sentences: Who are you?"
        }
      ],
      model: n
    }, m = await fetch(s, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${e.apiKey}`
      },
      body: JSON.stringify(y)
    }), i = await m.json();
    if (!m.ok)
      throw new Error("message" in i ? i.message : JSON.stringify(i));
    return i.choices[0].message.content;
  }
}
const ge = "" + new URL("dummy_worker.js", import.meta.url).href, ye = "" + new URL("py_worker.js", import.meta.url).href;
console.log("Hello from 'main'");
const Y = new Worker(ge, { type: "module" }), X = new Worker(ye, { type: "module" });
X.onmessage = (r) => {
  console.log("From pyWorker:", r.data);
};
X.postMessage({ type: "init" });
document.addEventListener("DOMContentLoaded", () => {
  console.log("dom content loaded"), Y.postMessage("hello worker?"), Y.onmessage = (m) => {
    console.log("Message received from worker:", m.data);
  };
  const r = ie();
  console.log("global options", r);
  const e = de(
    document.querySelectorAll(".activity")
  );
  document.body.appendChild(
    he({
      activities: e.activitities.map((m) => m.meta)
    })
  );
  const s = new ue(), n = document.querySelector("#ai-settings-form");
  if (n) {
    console.log("Initializing AI settings form"), new pe(n, s);
    const m = document.querySelector("#test-connection"), i = document.querySelector("#connection-status");
    m && i && m.addEventListener("click", async () => {
      const x = s.load();
      if (!x?.apiKey) {
        i.style.display = "block", i.className = "status-message error", i.textContent = "Please save your settings first before testing.";
        return;
      }
      i.style.display = "block", i.className = "status-message", i.textContent = "Testing connection...";
      try {
        const $ = await new J(r.prompts).ping(x);
        i.className = "status-message success", i.innerHTML = `✅ Connection successful!<br><em>AI Response: "${$.substring(0, 100)}${$.length > 100 ? "..." : ""}"</em>`;
      } catch (g) {
        i.className = "status-message error", g instanceof Error ? g.message.includes("401") || g.message.includes("Unauthorized") ? i.textContent = "❌ Authentication failed: Invalid API key. Please check your OpenRouter key." : g.message.includes("429") ? i.textContent = "❌ Rate limit exceeded. Please wait a moment and try again." : g.message.includes("fetch") || g.message.includes("NetworkError") ? i.textContent = "❌ Network error: Unable to reach OpenRouter. Check your internet connection." : i.textContent = `❌ Error: ${g.message}` : i.textContent = `❌ An unexpected error occurred: ${String(g)}`;
      }
    });
  }
  const y = new J(r.prompts);
  document.body.appendChild(
    me({
      aiProvider: y,
      settingsStore: s,
      prompts: r.prompts,
      documentContext: r.documentContext
    })
  );
});
