const { contextBridge, shell, ipcRenderer } = require('electron');
const { version } = require('./package.json');
const crypto = require('crypto');
const {
  generateSeed,
  deriveAddress,
  deriveSecretKey,
  derivePublicKey,
  createBlock,
  computeWork,
  validateWork,
  convert,
  Unit,
} = require('nanocurrency');

contextBridge.exposeInMainWorld('nyano', {
  platform: process.platform,
  version,
  generateSeed,
  deriveAddress: (seed, index = 0) =>
    deriveAddress(seed, index, { prefix: 'nyano_' }),
  deriveNanoAddress: (seed, index = 0) =>
    deriveAddress(seed, index, { prefix: 'nano_' }),
  deriveSecretKey,
  derivePublicKey,
  createBlock,
  computeWork,
  validateWork,
  convert,
  Unit,
  openExternal: (url) => shell.openExternal(url),
  encryptSeed: (seed, password) => {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(password).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const enc = Buffer.concat([cipher.update(seed, 'utf8'), cipher.final()]);
    return iv.toString('hex') + ':' + enc.toString('hex');
  },
  decryptSeed: (enc, password) => {
    try {
      const [ivHex, dataHex] = enc.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const data = Buffer.from(dataHex, 'hex');
      const key = crypto.createHash('sha256').update(password).digest();
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      const dec = Buffer.concat([decipher.update(data), decipher.final()]);
      return dec.toString('utf8');
    } catch {
      return null;
    }
  },
  startNode: () => ipcRenderer.invoke('start-node'),
  stopNode: () => ipcRenderer.invoke('stop-node'),
  nodeStatus: () => ipcRenderer.invoke('node-status'),
});
