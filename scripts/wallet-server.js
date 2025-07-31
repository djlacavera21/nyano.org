#!/usr/bin/env node
const express = require('express');
const {
  generateWallet,
  deriveWalletFromSeed,
  deriveWalletFromMnemonic,
  deriveAddresses,
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Wallet API listening on port ${port}`);
});
