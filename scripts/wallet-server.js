#!/usr/bin/env node
const express = require('express');
const {
  generateWallet,
  deriveWalletFromSeed,
  deriveWalletFromMnemonic,
} = require('../lib/wallet');

const app = express();
app.use(express.json());

app.get('/generate', (req, res) => {
  const index = parseInt(req.query.index || '0', 10);
  const prefix = req.query.prefix || 'nano_';
  const wallet = generateWallet(index, prefix);
  res.json(wallet);
});

app.post('/derive', (req, res) => {
  const { seed, mnemonic } = req.body;
  const index = req.body.index ? parseInt(req.body.index, 10) : 0;
  const prefix = req.body.prefix || 'nano_';
  try {
    let wallet;
    if (seed) {
      wallet = deriveWalletFromSeed(seed, index, prefix);
    } else if (mnemonic) {
      wallet = deriveWalletFromMnemonic(mnemonic, index, prefix);
    } else {
      return res.status(400).json({ error: 'seed or mnemonic required' });
    }
    res.json(wallet);
  } catch (err) {
    res.status(400).json({ error: 'invalid data' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Wallet API listening on port ${port}`);
});
