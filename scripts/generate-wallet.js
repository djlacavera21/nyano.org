#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { generateWallet } = require('../lib/wallet');

const outPath = process.argv[2];
const index = process.argv[3] ? parseInt(process.argv[3], 10) : 0;

const { seed, mnemonic, address } = generateWallet(index);

const data = { seed, mnemonic, address };

if (outPath) {
  const file = path.resolve(outPath);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`Wallet written to ${file}`);
} else {
  console.log(`Seed: ${seed}`);
  console.log(`Mnemonic: ${mnemonic}`);
  console.log(`Address: ${address}`);
}
