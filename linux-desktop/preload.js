const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('nyano', {
  platform: process.platform
});
