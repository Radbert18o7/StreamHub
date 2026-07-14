export function parseM3u(text) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/m3uParser.worker.js', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e) => {
      resolve(e.data.channels);
      worker.terminate();
    };
    
    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };
    
    worker.postMessage({ text });
  });
}
