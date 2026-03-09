// Preload script — runs before web content loads
// Provides a safe bridge between the renderer and Node.js

const { contextBridge } = require('electron');

// Expose a minimal API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true
});
