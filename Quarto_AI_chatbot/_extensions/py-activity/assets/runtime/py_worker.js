var Se = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var xe = Se((Ue, x) => {
  var Ie = Object.defineProperty, a = (e, t) => Ie(e, "name", { value: t, configurable: !0 }), $ = ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, { get: (t, r) => (typeof require < "u" ? require : t)[r] }) : e)(function(e) {
    if (typeof require < "u") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + e + '" is not supported');
  }), Ae = (() => {
    for (var e = new Uint8Array(128), t = 0; t < 64; t++) e[t < 26 ? t + 65 : t < 52 ? t + 71 : t < 62 ? t - 4 : t * 4 - 205] = t;
    return (r) => {
      for (var i = r.length, n = new Uint8Array((i - (r[i - 1] == "=") - (r[i - 2] == "=")) * 3 / 4 | 0), o = 0, s = 0; o < i; ) {
        var l = e[r.charCodeAt(o++)], c = e[r.charCodeAt(o++)], u = e[r.charCodeAt(o++)], d = e[r.charCodeAt(o++)];
        n[s++] = l << 2 | c >> 4, n[s++] = c << 4 | u >> 2, n[s++] = u << 6 | d;
      }
      return n;
    };
  })();
  function B(e) {
    return !isNaN(parseFloat(e)) && isFinite(e);
  }
  a(B, "_isNumber");
  function g(e) {
    return e.charAt(0).toUpperCase() + e.substring(1);
  }
  a(g, "_capitalize");
  function P(e) {
    return function() {
      return this[e];
    };
  }
  a(P, "_getter");
  var N = ["isConstructor", "isEval", "isNative", "isToplevel"], S = ["columnNumber", "lineNumber"], I = ["fileName", "functionName", "source"], Oe = ["args"], _e = ["evalOrigin"], F = N.concat(S, I, Oe, _e);
  function m(e) {
    if (e) for (var t = 0; t < F.length; t++) e[F[t]] !== void 0 && this["set" + g(F[t])](e[F[t]]);
  }
  a(m, "StackFrame");
  m.prototype = { getArgs: a(function() {
    return this.args;
  }, "getArgs"), setArgs: a(function(e) {
    if (Object.prototype.toString.call(e) !== "[object Array]") throw new TypeError("Args must be an Array");
    this.args = e;
  }, "setArgs"), getEvalOrigin: a(function() {
    return this.evalOrigin;
  }, "getEvalOrigin"), setEvalOrigin: a(function(e) {
    if (e instanceof m) this.evalOrigin = e;
    else if (e instanceof Object) this.evalOrigin = new m(e);
    else throw new TypeError("Eval Origin must be an Object or StackFrame");
  }, "setEvalOrigin"), toString: a(function() {
    var e = this.getFileName() || "", t = this.getLineNumber() || "", r = this.getColumnNumber() || "", i = this.getFunctionName() || "";
    return this.getIsEval() ? e ? "[eval] (" + e + ":" + t + ":" + r + ")" : "[eval]:" + t + ":" + r : i ? i + " (" + e + ":" + t + ":" + r + ")" : e + ":" + t + ":" + r;
  }, "toString") };
  m.fromString = a(function(e) {
    var t = e.indexOf("("), r = e.lastIndexOf(")"), i = e.substring(0, t), n = e.substring(t + 1, r).split(","), o = e.substring(r + 1);
    if (o.indexOf("@") === 0) var s = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(o, ""), l = s[1], c = s[2], u = s[3];
    return new m({ functionName: i, args: n || void 0, fileName: l, lineNumber: c || void 0, columnNumber: u || void 0 });
  }, "StackFrame$$fromString");
  for (w = 0; w < N.length; w++) m.prototype["get" + g(N[w])] = P(N[w]), m.prototype["set" + g(N[w])] = /* @__PURE__ */ (function(e) {
    return function(t) {
      this[e] = !!t;
    };
  })(N[w]);
  var w;
  for (v = 0; v < S.length; v++) m.prototype["get" + g(S[v])] = P(S[v]), m.prototype["set" + g(S[v])] = /* @__PURE__ */ (function(e) {
    return function(t) {
      if (!B(t)) throw new TypeError(e + " must be a Number");
      this[e] = Number(t);
    };
  })(S[v]);
  var v;
  for (E = 0; E < I.length; E++) m.prototype["get" + g(I[E])] = P(I[E]), m.prototype["set" + g(I[E])] = /* @__PURE__ */ (function(e) {
    return function(t) {
      this[e] = String(t);
    };
  })(I[E]);
  var E, D = m;
  function j() {
    var e = /^\s*at .*(\S+:\d+|\(native\))/m, t = /^(eval@)?(\[native code])?$/;
    return { parse: a(function(r) {
      if (r.stack && r.stack.match(e)) return this.parseV8OrIE(r);
      if (r.stack) return this.parseFFOrSafari(r);
      throw new Error("Cannot parse given Error object");
    }, "ErrorStackParser$$parse"), extractLocation: a(function(r) {
      if (r.indexOf(":") === -1) return [r];
      var i = /(.+?)(?::(\d+))?(?::(\d+))?$/, n = i.exec(r.replace(/[()]/g, ""));
      return [n[1], n[2] || void 0, n[3] || void 0];
    }, "ErrorStackParser$$extractLocation"), parseV8OrIE: a(function(r) {
      var i = r.stack.split(`
`).filter(function(n) {
        return !!n.match(e);
      }, this);
      return i.map(function(n) {
        n.indexOf("(eval ") > -1 && (n = n.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, ""));
        var o = n.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, ""), s = o.match(/ (\(.+\)$)/);
        o = s ? o.replace(s[0], "") : o;
        var l = this.extractLocation(s ? s[1] : o), c = s && o || void 0, u = ["eval", "<anonymous>"].indexOf(l[0]) > -1 ? void 0 : l[0];
        return new D({ functionName: c, fileName: u, lineNumber: l[1], columnNumber: l[2], source: n });
      }, this);
    }, "ErrorStackParser$$parseV8OrIE"), parseFFOrSafari: a(function(r) {
      var i = r.stack.split(`
`).filter(function(n) {
        return !n.match(t);
      }, this);
      return i.map(function(n) {
        if (n.indexOf(" > eval") > -1 && (n = n.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1")), n.indexOf("@") === -1 && n.indexOf(":") === -1) return new D({ functionName: n });
        var o = /((.*".+"[^@]*)?[^@]*)(?:@)/, s = n.match(o), l = s && s[1] ? s[1] : void 0, c = this.extractLocation(n.replace(o, ""));
        return new D({ functionName: l, fileName: c[0], lineNumber: c[1], columnNumber: c[2], source: n });
      }, this);
    }, "ErrorStackParser$$parseFFOrSafari") };
  }
  a(j, "ErrorStackParser");
  var ke = new j(), Fe = ke;
  function H() {
    if (typeof API < "u" && API !== globalThis.API) return API.runtimeEnv;
    let e = typeof Bun < "u", t = typeof Deno < "u", r = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && !process.browser, i = typeof navigator == "object" && typeof navigator.userAgent == "string" && navigator.userAgent.indexOf("Chrome") === -1 && navigator.userAgent.indexOf("Safari") > -1;
    return z({ IN_BUN: e, IN_DENO: t, IN_NODE: r, IN_SAFARI: i, IN_SHELL: typeof read == "function" && typeof load == "function" });
  }
  a(H, "getGlobalRuntimeEnv");
  var f = H();
  function z(e) {
    let t = e.IN_NODE && typeof x < "u" && x.exports && typeof $ == "function" && typeof __dirname == "string", r = e.IN_NODE && !t, i = !e.IN_NODE && !e.IN_DENO && !e.IN_BUN, n = i && typeof window < "u" && typeof window.document < "u" && typeof document.createElement == "function" && "sessionStorage" in window && typeof globalThis.importScripts != "function", o = i && typeof globalThis.WorkerGlobalScope < "u" && typeof globalThis.self < "u" && globalThis.self instanceof globalThis.WorkerGlobalScope;
    return { ...e, IN_BROWSER: i, IN_BROWSER_MAIN_THREAD: n, IN_BROWSER_WEB_WORKER: o, IN_NODE_COMMONJS: t, IN_NODE_ESM: r };
  }
  a(z, "calculateDerivedFlags");
  var V, L, q, M, T;
  async function U() {
    if (!f.IN_NODE || (V = (await import("./__vite-browser-external.js")).default, M = await import("./__vite-browser-external.js"), T = await import("./__vite-browser-external.js"), q = (await import("./__vite-browser-external.js")).default, L = await import("./__vite-browser-external.js"), C = L.sep, typeof $ < "u")) return;
    let e = M, t = await import("./__vite-browser-external.js"), r = await import("./__vite-browser-external.js"), i = await import("./__vite-browser-external.js"), n = { fs: e, crypto: t, ws: r, child_process: i };
    globalThis.require = function(o) {
      return n[o];
    };
  }
  a(U, "initNodeModules");
  function G(e, t) {
    return L.resolve(t || ".", e);
  }
  a(G, "node_resolvePath");
  function J(e, t) {
    return t === void 0 && (t = location), new URL(e, t).toString();
  }
  a(J, "browser_resolvePath");
  var _;
  f.IN_NODE ? _ = G : f.IN_SHELL ? _ = a((e) => e, "resolvePath") : _ = J;
  var C;
  f.IN_NODE || (C = "/");
  function K(e, t) {
    return e.startsWith("file://") && (e = e.slice(7)), e.includes("://") ? { response: fetch(e) } : { binary: T.readFile(e).then((r) => new Uint8Array(r.buffer, r.byteOffset, r.byteLength)) };
  }
  a(K, "node_getBinaryResponse");
  function Y(e, t) {
    if (e.startsWith("file://") && (e = e.slice(7)), e.includes("://")) throw new Error("Shell cannot fetch urls");
    return { binary: Promise.resolve(new Uint8Array(readbuffer(e))) };
  }
  a(Y, "shell_getBinaryResponse");
  function Z(e, t) {
    let r = new URL(e, location);
    return { response: fetch(r, t ? { integrity: t } : {}) };
  }
  a(Z, "browser_getBinaryResponse");
  var k;
  f.IN_NODE ? k = K : f.IN_SHELL ? k = Y : k = Z;
  async function Q(e, t) {
    let { response: r, binary: i } = k(e, t);
    if (i) return i;
    let n = await r;
    if (!n.ok) throw new Error(`Failed to load '${e}': request failed.`);
    return new Uint8Array(await n.arrayBuffer());
  }
  a(Q, "loadBinaryFile");
  var A;
  if (f.IN_BROWSER_MAIN_THREAD) A = a(async (e) => await import(e), "loadScript");
  else if (f.IN_BROWSER_WEB_WORKER) A = a(async (e) => {
    try {
      globalThis.importScripts(e);
    } catch (t) {
      if (t instanceof TypeError) await import(e);
      else throw t;
    }
  }, "loadScript");
  else if (f.IN_NODE) A = X;
  else if (f.IN_SHELL) A = load;
  else throw new Error("Cannot determine runtime environment");
  async function X(e) {
    e.startsWith("file://") && (e = e.slice(7)), e.includes("://") ? q.runInThisContext(await (await fetch(e)).text()) : await import(V.pathToFileURL(e).href);
  }
  a(X, "nodeLoadScript");
  async function ee(e) {
    if (f.IN_NODE) {
      await U();
      let t = await T.readFile(e, { encoding: "utf8" });
      return JSON.parse(t);
    } else if (f.IN_SHELL) {
      let t = read(e);
      return JSON.parse(t);
    } else return await (await fetch(e)).json();
  }
  a(ee, "loadLockFile");
  async function te() {
    if (f.IN_NODE_COMMONJS) return __dirname;
    let e;
    try {
      throw new Error();
    } catch (i) {
      e = i;
    }
    let t = Fe.parse(e)[0].fileName;
    if (f.IN_NODE && !t.startsWith("file://") && (t = `file://${t}`), f.IN_NODE_ESM) {
      let i = await import("./__vite-browser-external.js");
      return (await import("./__vite-browser-external.js")).fileURLToPath(i.dirname(t));
    }
    let r = t.lastIndexOf(C);
    if (r === -1) throw new Error("Could not extract indexURL path from pyodide module location. Please pass the indexURL explicitly to loadPyodide.");
    return t.slice(0, r);
  }
  a(te, "calculateDirname");
  function re(e) {
    return e.substring(0, e.lastIndexOf("/") + 1) || globalThis.location?.toString() || ".";
  }
  a(re, "calculateInstallBaseUrl");
  function ne(e) {
    let t = e.FS, r = e.FS.filesystems.MEMFS, i = e.PATH, n = { DIR_MODE: 16895, FILE_MODE: 33279, mount: a(function(o) {
      if (!o.opts.fileSystemHandle) throw new Error("opts.fileSystemHandle is required");
      return r.mount.apply(null, arguments);
    }, "mount"), syncfs: a(async (o, s, l) => {
      try {
        let c = n.getLocalSet(o), u = await n.getRemoteSet(o), d = s ? u : c, y = s ? c : u;
        await n.reconcile(o, d, y), l(null);
      } catch (c) {
        l(c);
      }
    }, "syncfs"), getLocalSet: a((o) => {
      let s = /* @__PURE__ */ Object.create(null);
      function l(d) {
        return d !== "." && d !== "..";
      }
      a(l, "isRealDir");
      function c(d) {
        return (y) => i.join2(d, y);
      }
      a(c, "toAbsolute");
      let u = t.readdir(o.mountpoint).filter(l).map(c(o.mountpoint));
      for (; u.length; ) {
        let d = u.pop(), y = t.stat(d);
        t.isDir(y.mode) && u.push.apply(u, t.readdir(d).filter(l).map(c(d))), s[d] = { timestamp: y.mtime, mode: y.mode };
      }
      return { type: "local", entries: s };
    }, "getLocalSet"), getRemoteSet: a(async (o) => {
      let s = /* @__PURE__ */ Object.create(null), l = await Re(o.opts.fileSystemHandle);
      for (let [c, u] of l) c !== "." && (s[i.join2(o.mountpoint, c)] = { timestamp: u.kind === "file" ? new Date((await u.getFile()).lastModified) : /* @__PURE__ */ new Date(), mode: u.kind === "file" ? n.FILE_MODE : n.DIR_MODE });
      return { type: "remote", entries: s, handles: l };
    }, "getRemoteSet"), loadLocalEntry: a((o) => {
      let s = t.lookupPath(o, {}).node, l = t.stat(o);
      if (t.isDir(l.mode)) return { timestamp: l.mtime, mode: l.mode };
      if (t.isFile(l.mode)) return s.contents = r.getFileDataAsTypedArray(s), { timestamp: l.mtime, mode: l.mode, contents: s.contents };
      throw new Error("node type not supported");
    }, "loadLocalEntry"), storeLocalEntry: a((o, s) => {
      if (t.isDir(s.mode)) t.mkdirTree(o, s.mode);
      else if (t.isFile(s.mode)) t.writeFile(o, s.contents, { canOwn: !0 });
      else throw new Error("node type not supported");
      t.chmod(o, s.mode), t.utime(o, s.timestamp, s.timestamp);
    }, "storeLocalEntry"), removeLocalEntry: a((o) => {
      var s = t.stat(o);
      t.isDir(s.mode) ? t.rmdir(o) : t.isFile(s.mode) && t.unlink(o);
    }, "removeLocalEntry"), loadRemoteEntry: a(async (o) => {
      if (o.kind === "file") {
        let s = await o.getFile();
        return { contents: new Uint8Array(await s.arrayBuffer()), mode: n.FILE_MODE, timestamp: new Date(s.lastModified) };
      } else {
        if (o.kind === "directory") return { mode: n.DIR_MODE, timestamp: /* @__PURE__ */ new Date() };
        throw new Error("unknown kind: " + o.kind);
      }
    }, "loadRemoteEntry"), storeRemoteEntry: a(async (o, s, l) => {
      let c = o.get(i.dirname(s)), u = t.isFile(l.mode) ? await c.getFileHandle(i.basename(s), { create: !0 }) : await c.getDirectoryHandle(i.basename(s), { create: !0 });
      if (u.kind === "file") {
        let d = await u.createWritable();
        await d.write(l.contents), await d.close();
      }
      o.set(s, u);
    }, "storeRemoteEntry"), removeRemoteEntry: a(async (o, s) => {
      await o.get(i.dirname(s)).removeEntry(i.basename(s)), o.delete(s);
    }, "removeRemoteEntry"), reconcile: a(async (o, s, l) => {
      let c = 0, u = [];
      Object.keys(s.entries).forEach(function(p) {
        let h = s.entries[p], b = l.entries[p];
        (!b || t.isFile(h.mode) && h.timestamp.getTime() > b.timestamp.getTime()) && (u.push(p), c++);
      }), u.sort();
      let d = [];
      if (Object.keys(l.entries).forEach(function(p) {
        s.entries[p] || (d.push(p), c++);
      }), d.sort().reverse(), !c) return;
      let y = s.type === "remote" ? s.handles : l.handles;
      for (let p of u) {
        let h = i.normalize(p.replace(o.mountpoint, "/")).substring(1);
        if (l.type === "local") {
          let b = y.get(h), Ne = await n.loadRemoteEntry(b);
          n.storeLocalEntry(p, Ne);
        } else {
          let b = n.loadLocalEntry(p);
          await n.storeRemoteEntry(y, h, b);
        }
      }
      for (let p of d) if (l.type === "local") n.removeLocalEntry(p);
      else {
        let h = i.normalize(p.replace(o.mountpoint, "/")).substring(1);
        await n.removeRemoteEntry(y, h);
      }
    }, "reconcile") };
    e.FS.filesystems.NATIVEFS_ASYNC = n;
  }
  a(ne, "initializeNativeFS");
  var Re = a(async (e) => {
    let t = [];
    async function r(n) {
      for await (let o of n.values()) t.push(o), o.kind === "directory" && await r(o);
    }
    a(r, "collect"), await r(e);
    let i = /* @__PURE__ */ new Map();
    i.set(".", e);
    for (let n of t) {
      let o = (await e.resolve(n)).join("/");
      i.set(o, n);
    }
    return i;
  }, "getFsHandles"), Pe = Ae("AGFzbQEAAAABDANfAGAAAW9gAW8BfwMDAgECByECD2NyZWF0ZV9zZW50aW5lbAAAC2lzX3NlbnRpbmVsAAEKEwIHAPsBAPsbCwkAIAD7GvsUAAs="), De = (async function() {
    if (!(globalThis.navigator && (/iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && typeof navigator.maxTouchPoints < "u" && navigator.maxTouchPoints > 1))) try {
      let e = await WebAssembly.compile(Pe);
      return await WebAssembly.instantiate(e);
    } catch (e) {
      if (e instanceof WebAssembly.CompileError) return;
      throw e;
    }
  })();
  async function ie() {
    let e = await De;
    if (e) return e.exports;
    let t = /* @__PURE__ */ Symbol("error marker");
    return { create_sentinel: a(() => t, "create_sentinel"), is_sentinel: a((r) => r === t, "is_sentinel") };
  }
  a(ie, "getSentinelImport");
  function oe(e) {
    let t = { config: e, runtimeEnv: f }, r = { noImageDecoding: !0, noAudioDecoding: !0, noWasmDecoding: !1, preRun: de(e), print: e.stdout, printErr: e.stderr, onExit(i) {
      r.exitCode = i;
    }, thisProgram: e._sysExecutable, arguments: e.args, API: t, locateFile: a((i) => e.indexURL + i, "locateFile"), instantiateWasm: fe(e.indexURL) };
    return r;
  }
  a(oe, "createSettings");
  function ae(e) {
    return function(t) {
      let r = "/";
      try {
        t.FS.mkdirTree(e);
      } catch (i) {
        console.error(`Error occurred while making a home directory '${e}':`), console.error(i), console.error(`Using '${r}' for a home directory instead`), e = r;
      }
      t.FS.chdir(e);
    };
  }
  a(ae, "createHomeDirectory");
  function se(e) {
    return function(t) {
      Object.assign(t.ENV, e);
    };
  }
  a(se, "setEnvironment");
  function le(e) {
    return e ? [async (t) => {
      t.addRunDependency("fsInitHook");
      try {
        await e(t.FS, { sitePackages: t.API.sitePackages });
      } finally {
        t.removeRunDependency("fsInitHook");
      }
    }] : [];
  }
  a(le, "callFsInitHook");
  function ce(e) {
    let t = e.HEAPU32[e._Py_Version >>> 2], r = t >>> 24 & 255, i = t >>> 16 & 255, n = t >>> 8 & 255;
    return [r, i, n];
  }
  a(ce, "computeVersionTuple");
  function ue(e) {
    let t = Q(e);
    return async (r) => {
      r.API.pyVersionTuple = ce(r);
      let [i, n] = r.API.pyVersionTuple;
      r.FS.mkdirTree("/lib"), r.API.sitePackages = `/lib/python${i}.${n}/site-packages`, r.FS.mkdirTree(r.API.sitePackages), r.addRunDependency("install-stdlib");
      try {
        let o = await t;
        r.FS.writeFile(`/lib/python${i}${n}.zip`, o);
      } catch (o) {
        console.error("Error occurred while installing the standard library:"), console.error(o);
      } finally {
        r.removeRunDependency("install-stdlib");
      }
    };
  }
  a(ue, "installStdlib");
  function de(e) {
    let t;
    return e.stdLibURL != null ? t = e.stdLibURL : t = e.indexURL + "python_stdlib.zip", [ue(t), ae(e.env.HOME), se(e.env), ne, ...le(e.fsInit)];
  }
  a(de, "getFileSystemInitializationFuncs");
  function fe(e) {
    if (typeof WasmOffsetConverter < "u") return;
    let { binary: t, response: r } = k(e + "pyodide.asm.wasm"), i = ie();
    return function(n, o) {
      return (async function() {
        n.sentinel = await i;
        try {
          let s;
          r ? s = await WebAssembly.instantiateStreaming(r, n) : s = await WebAssembly.instantiate(await t, n);
          let { instance: l, module: c } = s;
          o(l, c);
        } catch (s) {
          console.warn("wasm instantiation failed!"), console.warn(s);
        }
      })(), {};
    };
  }
  a(fe, "getInstantiateWasmFunc");
  var Le = "0.29.2";
  function O(e) {
    return e === void 0 || e.endsWith("/") ? e : e + "/";
  }
  a(O, "withTrailingSlash");
  var R = Le;
  async function pe(e = {}) {
    if (await U(), e.lockFileContents && e.lockFileURL) throw new Error("Can't pass both lockFileContents and lockFileURL");
    let t = e.indexURL || await te();
    if (t = O(_(t)), e.packageBaseUrl = O(e.packageBaseUrl), e.cdnUrl = O(e.packageBaseUrl ?? `https://cdn.jsdelivr.net/pyodide/v${R}/full/`), !e.lockFileContents) {
      let n = e.lockFileURL ?? t + "pyodide-lock.json";
      e.lockFileContents = ee(n), e.packageBaseUrl ??= re(n);
    }
    e.indexURL = t, e.packageCacheDir && (e.packageCacheDir = O(_(e.packageCacheDir)));
    let r = { fullStdLib: !1, jsglobals: globalThis, stdin: globalThis.prompt ? () => globalThis.prompt() : void 0, args: [], env: {}, packages: [], packageCacheDir: e.packageBaseUrl, enableRunUntilComplete: !0, checkAPIVersion: !0, BUILD_ID: "02af97d1069c4309880e46f2948861ea1faae5dbb49c20d5d5970aa9ae912fd4" }, i = Object.assign(r, e);
    return i.env.HOME ??= "/home/pyodide", i.env.PYTHONINSPECT ??= "1", i;
  }
  a(pe, "initializeConfiguration");
  function me(e) {
    let t = oe(e), r = t.API;
    return r.lockFilePromise = Promise.resolve(e.lockFileContents), t;
  }
  a(me, "createEmscriptenSettings");
  async function ye(e) {
    if (typeof _createPyodideModule != "function") {
      let t = `${e.indexURL}pyodide.asm.js`;
      await A(t);
    }
  }
  a(ye, "loadWasmScript");
  async function ge(e, t) {
    if (!e._loadSnapshot) return;
    let r = await e._loadSnapshot, i = ArrayBuffer.isView(r) ? r : new Uint8Array(r);
    return t.noInitialRun = !0, t.INITIAL_MEMORY = i.length, i;
  }
  a(ge, "prepareSnapshot");
  async function he(e) {
    let t = await _createPyodideModule(e);
    if (e.exitCode !== void 0) throw new t.ExitStatus(e.exitCode);
    return t;
  }
  a(he, "createPyodideModule");
  function we(e, t) {
    let r = e.API;
    if (t.pyproxyToStringRepr && r.setPyProxyToStringMethod(!0), t.convertNullToNone && r.setCompatNullToNone(!0), t.toJsLiteralMap && r.setCompatToJsLiteralMap(!0), r.version !== R && t.checkAPIVersion) throw new Error(`Pyodide version does not match: '${R}' <==> '${r.version}'. If you updated the Pyodide version, make sure you also updated the 'indexURL' parameter passed to loadPyodide.`);
    e.locateFile = (i) => {
      throw i.endsWith(".so") ? new Error(`Failed to find dynamic library "${i}"`) : new Error(`Unexpected call to locateFile("${i}")`);
    };
  }
  a(we, "configureAPI");
  function ve(e, t, r) {
    let i = e.API, n;
    return t && (n = i.restoreSnapshot(t)), i.finalizeBootstrap(n, r._snapshotDeserializer);
  }
  a(ve, "bootstrapPyodide");
  async function Ee(e, t) {
    let r = e._api;
    return r.sys.path.insert(0, ""), r._pyodide.set_excepthook(), await r.packageIndexReady, r.initializeStreams(t.stdin, t.stdout, t.stderr), e;
  }
  a(Ee, "finalizeSetup");
  async function be(e = {}) {
    let t = await pe(e), r = me(t);
    await ye(t);
    let i = await ge(t, r), n = await he(r);
    we(n, t);
    let o = ve(n, i, t);
    return await Ee(o, t);
  }
  a(be, "loadPyodide");
  const W = be({
    indexURL: `https://cdn.jsdelivr.net/pyodide/v${R}/full/pyodide.js`
  });
  self.onmessage = async (e) => {
    const { type: t, code: r } = e.data;
    if (t === "init") {
      console.log("init py-worker...");
      const n = (await W).runPythonAsync("print('hello from python')");
      console.log(n), self.postMessage({ type: "ready" });
    }
    if (t === "run")
      try {
        const n = (await W).runPython(r);
        self.postMessage({ type: "result", result: n });
      } catch (i) {
        self.postMessage({ type: "error", error: i.toString() });
      }
  };
});
export default xe();
