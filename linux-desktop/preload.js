const { contextBridge, shell } = require('electron');
const { version } = require('./package.json');
const {
  generateSeed,
  deriveAddress,
  deriveSecretKey,
  derivePublicKey,
  createBlock,
  convert,
  Unit
} = require('nanocurrency');

contextBridge.exposeInMainWorld('nyano', {
  platform: process.platform,
  version,
  generateSeed,
  deriveAddress: (seed, index = 0) =>
    deriveAddress(seed, index, { prefix: 'nyano_' }),
  deriveSecretKey,
  derivePublicKey,
  createBlock,
  convert,
  Unit,
  openExternal: url => shell.openExternal(url)
});
