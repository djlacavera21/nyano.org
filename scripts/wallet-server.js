#!/usr/bin/env node
const express = require('express');
const {
  generateWallet,
  deriveWalletFromSeed,
  deriveWalletFromMnemonic,
  deriveAddresses,
  deriveSecretKeyFromSeed,
  derivePublicKeyFromSeed,
  deriveSecretKeyFromMnemonic,
  derivePublicKeyFromMnemonic,
  validateSeed,
  validateMnemonic,
  validateAddress,
  validateSecretKey,
  encryptSeed,
  decryptSeed,
} = require('../lib/wallet');

const app = express();
app.use(express.json());

app.get('/generate', async (req, res) => {
  const index = parseInt(req.query.index || '0', 10);
  const prefix = req.query.prefix || 'nano_';
  const count = req.query.count ? parseInt(req.query.count, 10) : 1;
  try {
    const wallet = await generateWallet(index, prefix);
    const addresses = deriveAddresses(wallet.seed, count, index, prefix);
    res.json({ ...wallet, addresses });
  } catch {
    res.status(500).json({ error: 'failed to generate wallet' });
  }
});

app.post('/derive', (req, res) => {
  const { seed, mnemonic } = req.body;
  const index = req.body.index ? parseInt(req.body.index, 10) : 0;
  const prefix = req.body.prefix || 'nano_';
  const count = req.body.count ? parseInt(req.body.count, 10) : 1;
  try {
    let wallet;
    if (seed) {
      wallet = deriveWalletFromSeed(seed, index, prefix);
    } else if (mnemonic) {
      wallet = deriveWalletFromMnemonic(mnemonic, index, prefix);
    } else {
      return res.status(400).json({ error: 'seed or mnemonic required' });
    }
    const addresses = deriveAddresses(wallet.seed, count, index, prefix);
    res.json({ ...wallet, addresses });
  } catch (err) {
    res.status(400).json({ error: 'invalid data' });
  }
});

app.post('/keys', (req, res) => {
  const { seed, mnemonic } = req.body;
  const index = req.body.index ? parseInt(req.body.index, 10) : 0;
  try {
    let secretKey;
    let publicKey;
    if (seed) {
      secretKey = deriveSecretKeyFromSeed(seed, index);
      publicKey = derivePublicKeyFromSeed(seed, index);
    } else if (mnemonic) {
      secretKey = deriveSecretKeyFromMnemonic(mnemonic, index);
      publicKey = derivePublicKeyFromMnemonic(mnemonic, index);
    } else {
      return res.status(400).json({ error: 'seed or mnemonic required' });
    }
    res.json({ secretKey, publicKey });
  } catch {
    res.status(400).json({ error: 'invalid data' });
  }
});

app.post('/encrypt', (req, res) => {
  const { seed, password } = req.body;
  if (!seed || !password) {
    return res.status(400).json({ error: 'seed and password required' });
  }
  try {
    const encryptedSeed = encryptSeed(seed, password);
    res.json({ encryptedSeed });
  } catch {
    res.status(500).json({ error: 'encryption failed' });
  }
});

app.post('/decrypt', (req, res) => {
  const { encryptedSeed, password } = req.body;
  if (!encryptedSeed || !password) {
    return res
      .status(400)
      .json({ error: 'encryptedSeed and password required' });
  }
  try {
    const seed = decryptSeed(encryptedSeed, password);
    res.json({ seed });
  } catch {
    res.status(400).json({ error: 'decryption failed' });
  }
});

app.post('/validate', (req, res) => {
  const { seed, mnemonic, address, secretKey } = req.body;
  res.json({
    seed: seed ? validateSeed(seed) : false,
    mnemonic: mnemonic ? validateMnemonic(mnemonic) : false,
    address: address ? validateAddress(address) : false,
    secretKey: secretKey ? validateSecretKey(secretKey) : false,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Wallet API listening on port ${port}`);
});
