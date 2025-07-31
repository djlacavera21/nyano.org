const {
  generateSeed,
  deriveSecretKey,
  derivePublicKey,
  deriveAddress,
  checkAddress,
  checkSeed,
} = require('nanocurrency');
const bip39 = require('bip39');
const crypto = require('crypto');

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

function encryptSeed(seed, password) {
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash('sha256').update(password).digest();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(seed, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('hex');
}

function decryptSeed(encryptedSeed, password) {
  const data = Buffer.from(encryptedSeed, 'hex');
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const enc = data.slice(28);
  const key = crypto.createHash('sha256').update(password).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(enc), decipher.final()]);
  return decrypted.toString('utf8');
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
  encryptSeed,
  decryptSeed,
};
