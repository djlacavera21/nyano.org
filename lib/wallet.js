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

function deriveSecretKeys(seed, count = 1, startIndex = 0) {
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push(deriveSecretKey(seed, startIndex + i));
  }
  return keys;
}

function derivePublicKeys(seed, count = 1, startIndex = 0) {
  const keys = [];
  for (let i = 0; i < count; i++) {
    const secret = deriveSecretKey(seed, startIndex + i);
    keys.push(derivePublicKey(secret));
  }
  return keys;
}

function deriveAddressRecords(
  seed,
  count = 1,
  startIndex = 0,
  prefix = 'nano_',
) {
  const records = [];
  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    const secretKey = deriveSecretKey(seed, index);
    const publicKey = derivePublicKey(secretKey);
    const address = deriveAddress(seed, index, { prefix });
    records.push({ index, address, publicKey, secretKey });
  }
  return records;
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
  deriveAddresses,
  deriveSecretKeys,
  derivePublicKeys,
  deriveAddressRecords,
  validateSeed,
  validateMnemonic,
  validateAddress,
};
