const { contextBridge } = require('electron');
const { version } = require('./package.json');

contextBridge.exposeInMainWorld('nyano', {
  platform: process.platform,
  version
});
