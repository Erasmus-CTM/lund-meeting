import { loadPyodide, version as pyoVer } from "pyodide";

const pyodidePromise = loadPyodide({
  indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyoVer}/full/pyodide.js`,
});

self.onmessage = async (event) => {
  const { type, code } = event.data;

  if (type === "init") {
    console.log("init py-worker...");

    const pyodide = await pyodidePromise;
    const r = pyodide.runPythonAsync("print('hello from python')");
    console.log(r);

    // Load packages from default CDN
    // await pyodide.loadPackage(["numpy", "matplotlib"]);

    self.postMessage({ type: "ready" });
  }

  if (type === "run") {
    try {
      const pyodide = await pyodidePromise;
      const result = pyodide.runPython(code);
      self.postMessage({ type: "result", result });
    } catch (err: any) {
      self.postMessage({ type: "error", error: err.toString() });
    }
  }
};
