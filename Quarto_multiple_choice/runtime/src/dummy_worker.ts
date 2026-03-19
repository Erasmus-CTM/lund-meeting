// Simple file for testing web worker compatibility

onmessage = (e) => {
  console.log(`dummy worker received: '${e.data}'`);

  postMessage(`Hello from dummy worker`);
};
