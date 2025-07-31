#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  generateWallet,
  deriveWalletFromSeed,
  deriveWalletFromMnemonic,
} = require('../lib/wallet');

let outPath;
let index = 0;
let prefix = 'nano_';
let seed;
let mnemonic;

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--index':
      index = parseInt(args[++i], 10);
      break;
    case '--prefix':
      prefix = args[++i];
      break;
    case '--seed':
      seed = args[++i];
      break;
    case '--mnemonic':
      mnemonic = args[++i];
      break;
    default:
      if (!outPath) outPath = args[i];
  }
}

let wallet;
if (seed) {
  wallet = deriveWalletFromSeed(seed, index, prefix);
} else if (mnemonic) {
  wallet = deriveWalletFromMnemonic(mnemonic, index, prefix);
} else {
  wallet = generateWallet(index, prefix);
}

if (outPath) {
  const file = path.resolve(outPath);
  fs.writeFileSync(file, JSON.stringify(wallet, null, 2));
  console.log(`Wallet written to ${file}`);
} else {
  console.log(`Seed: ${wallet.seed}`);
  console.log(`Mnemonic: ${wallet.mnemonic}`);
  console.log(`Address: ${wallet.address}`);
}
