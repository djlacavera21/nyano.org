#!/usr/bin/env node
const { generateSeed, deriveAddress } = require('nanocurrency');
const fs = require('fs');
const path = require('path');

const seed = generateSeed();
const address = deriveAddress(seed, 0, { prefix: 'nano_' });

const data = { seed, address };
const outPath = process.argv[2];

if (outPath) {
  const file = path.resolve(outPath);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`Wallet written to ${file}`);
} else {
  console.log(`Seed: ${seed}`);
  console.log(`Address: ${address}`);
}
