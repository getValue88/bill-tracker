const { contextBridge } = require('electron');

// Expose a blank API for now; extend as needed.
contextBridge.exposeInMainWorld('electron', {
  // Example: you can expose functions here, e.g. ipc communication.
}); 