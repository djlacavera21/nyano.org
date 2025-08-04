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
const fs = require('fs');

function formatAddress(address, prefix) {
  if (!prefix || prefix === 'nano_' || prefix === 'xrb_') {
    return address.replace(/^(nano_|xrb_)/, prefix || 'nano_');
  }
  const idx = address.indexOf('_');
  return prefix + address.slice(idx + 1);
}

function addressFromSeed(seed, index = 0, prefix = 'nano_') {
  const secretKey = deriveSecretKey(seed, index);
  const publicKey = derivePublicKey(secretKey);
  return formatAddress(
    deriveAddress(publicKey, { useNanoPrefix: prefix !== 'xrb_' }),
    prefix,
  );
}

function seedFromMnemonic(mnemonic, passphrase = '') {
  if (passphrase) {
    return bip39
      .mnemonicToSeedSync(mnemonic, passphrase)
      .slice(0, 32)
      .toString('hex');
  }
  return bip39.mnemonicToEntropy(mnemonic);
}

async function generateWallet(index = 0, prefix = 'nano_') {
  const seed = await generateSeed();
  const mnemonic = bip39.entropyToMnemonic(seed);
  const address = addressFromSeed(seed, index, prefix);
  return { seed, mnemonic, address };
}

function deriveWalletFromSeed(seed, index = 0, prefix = 'nano_') {
  const address = addressFromSeed(seed, index, prefix);
  const mnemonic = bip39.entropyToMnemonic(seed);
  return { seed, mnemonic, address };
}

function deriveWalletFromMnemonic(
  mnemonic,
  index = 0,
  prefix = 'nano_',
  passphrase = '',
) {
  const seed = seedFromMnemonic(mnemonic, passphrase);
  return deriveWalletFromSeed(seed, index, prefix);
}

function deriveSecretKeyFromSeed(seed, index = 0) {
  return deriveSecretKey(seed, index);
}

function derivePublicKeyFromSeed(seed, index = 0) {
  const secretKey = deriveSecretKey(seed, index);
  return derivePublicKey(secretKey);
}

function deriveSecretKeyFromMnemonic(mnemonic, index = 0, passphrase = '') {
  const seed = seedFromMnemonic(mnemonic, passphrase);
  return deriveSecretKeyFromSeed(seed, index);
}

function derivePublicKeyFromMnemonic(mnemonic, index = 0, passphrase = '') {
  const seed = seedFromMnemonic(mnemonic, passphrase);
  return derivePublicKeyFromSeed(seed, index);
}

function derivePublicKeyFromSecretKey(secretKey) {
  return derivePublicKey(secretKey);
}

function validateSecretKey(secretKey) {
  return typeof secretKey === 'string' && /^[0-9A-Fa-f]{64}$/.test(secretKey);
}

function deriveWalletFromSecretKey(secretKey, prefix = 'nano_') {
  const publicKey = derivePublicKey(secretKey);
  const address = formatAddress(
    deriveAddress(publicKey, { useNanoPrefix: prefix !== 'xrb_' }),
    prefix,
  );
  return { secretKey, publicKey, address };
}

function deriveAddresses(seed, count = 1, startIndex = 0, prefix = 'nano_') {
  const addresses = [];
  for (let i = 0; i < count; i++) {
    addresses.push(addressFromSeed(seed, startIndex + i, prefix));
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

function saveWalletToFile(wallet, file, password) {
  const data = { address: wallet.address };
  if (wallet.mnemonic) data.mnemonic = wallet.mnemonic;
  if (wallet.seed) {
    if (password) {
      data.encryptedSeed = encryptSeed(wallet.seed, password);
    } else {
      data.seed = wallet.seed;
    }
  } else if (wallet.secretKey) {
    if (password) {
      data.encryptedSecretKey = encryptSeed(wallet.secretKey, password);
    } else {
      data.secretKey = wallet.secretKey;
    }
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function loadWalletFromFile(file, password) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let wallet;
  if (data.encryptedSeed) {
    if (!password) throw new Error('password required');
    const seed = decryptSeed(data.encryptedSeed, password);
    wallet = deriveWalletFromSeed(seed);
  } else if (data.seed) {
    wallet = deriveWalletFromSeed(data.seed);
  } else if (data.encryptedSecretKey) {
    if (!password) throw new Error('password required');
    const secretKey = decryptSeed(data.encryptedSecretKey, password);
    wallet = deriveWalletFromSecretKey(secretKey);
  } else if (data.secretKey) {
    wallet = deriveWalletFromSecretKey(data.secretKey);
  } else {
    throw new Error('no seed or secretKey found');
  }
  if (data.address && data.address !== wallet.address) {
    throw new Error('address mismatch');
  }
  return wallet;
}

module.exports = {
  generateWallet,
  deriveWalletFromSeed,
  deriveWalletFromMnemonic,
  deriveSecretKeyFromSeed,
  derivePublicKeyFromSeed,
  deriveSecretKeyFromMnemonic,
  derivePublicKeyFromMnemonic,
  derivePublicKeyFromSecretKey,
  validateSecretKey,
  deriveAddresses,
  validateSeed,
  validateMnemonic,
  validateAddress,
  encryptSeed,
  decryptSeed,
  seedFromMnemonic,
  saveWalletToFile,
  loadWalletFromFile,
  deriveWalletFromSecretKey,
};
