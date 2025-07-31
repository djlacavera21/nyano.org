const {
  generateSeed,
  deriveSecretKey,
  derivePublicKey,
  deriveAddress,
  checkAddress,
  checkSeed,
} = require('nanocurrency');
const bip39 = require('bip39');

async function generateWallet(index = 0, prefix = 'nano_') {
  const seed = await generateSeed();
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

function deriveSecretKeyFromSeed(seed, index = 0) {
  return deriveSecretKey(seed, index);
}

function derivePublicKeyFromSeed(seed, index = 0) {
  const secretKey = deriveSecretKey(seed, index);
  return derivePublicKey(secretKey);
}

function deriveSecretKeyFromMnemonic(mnemonic, index = 0) {
  const seed = bip39.mnemonicToEntropy(mnemonic);
  return deriveSecretKeyFromSeed(seed, index);
}

function derivePublicKeyFromMnemonic(mnemonic, index = 0) {
  const seed = bip39.mnemonicToEntropy(mnemonic);
  return derivePublicKeyFromSeed(seed, index);
}

function validateSecretKey(secretKey) {
  return typeof secretKey === 'string' && /^[0-9A-Fa-f]{64}$/.test(secretKey);
}

function deriveAddresses(seed, count = 1, startIndex = 0, prefix = 'nano_') {
  const addresses = [];
  for (let i = 0; i < count; i++) {
    addresses.push(deriveAddress(seed, startIndex + i, { prefix }));
  }
  return addresses;
}

function validateSeed(seed) {
  return checkSeed(seed);
}

function validateMnemonic(mnemonic) {
  return bip39.validateMnemonic(mnemonic);
}

function validateAddress(address) {
  return checkAddress(address);
}

module.exports = {
  generateWallet,
  deriveWalletFromSeed,
  deriveWalletFromMnemonic,
  deriveSecretKeyFromSeed,
  derivePublicKeyFromSeed,
  deriveSecretKeyFromMnemonic,
  derivePublicKeyFromMnemonic,
  validateSecretKey,
  deriveAddresses,
  validateSeed,
  validateMnemonic,
  validateAddress,
};
