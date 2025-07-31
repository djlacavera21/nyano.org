const { generateSeed, deriveAddress } = require('nanocurrency');
const bip39 = require('bip39');

function generateWallet(index = 0, prefix = 'nano_') {
  const seed = generateSeed();
  const mnemonic = bip39.entropyToMnemonic(seed);
  const address = deriveAddress(seed, index, { prefix });
  return { seed, mnemonic, address };
}

function deriveWalletFromSeed(seed, index = 0, prefix = 'nano_') {
  const address = deriveAddress(seed, index, { prefix });
  const mnemonic = bip39.entropyToMnemonic(seed);
  return { seed, mnemonic, address };
}

function deriveWalletFromMnemonic(mnemonic, index = 0, prefix = 'nano_') {
  const seed = bip39.mnemonicToEntropy(mnemonic);
  return deriveWalletFromSeed(seed, index, prefix);
}

function validateSeed(seed) {
  return typeof seed === 'string' && /^[0-9A-Fa-f]{64}$/.test(seed);
}

function validateMnemonic(mnemonic) {
  return bip39.validateMnemonic(mnemonic);
}

module.exports = {
  generateWallet,
  deriveWalletFromSeed,
  deriveWalletFromMnemonic,
  validateSeed,
  validateMnemonic,
};
