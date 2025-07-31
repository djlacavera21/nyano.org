#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  generateWallet,
  deriveWalletFromSeed,
  deriveWalletFromMnemonic,
  deriveAddresses,
  deriveAddressRecords,
} = require('../lib/wallet');

let outPath;
let index = 0;
let prefix = 'nano_';
let count = 1;
let seed;
let mnemonic;
let includeKeys = false;

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--index':
      index = parseInt(args[++i], 10);
      break;
    case '--prefix':
      prefix = args[++i];
      break;
    case '--count':
      count = parseInt(args[++i], 10);
      break;
    case '--seed':
      seed = args[++i];
      break;
    case '--mnemonic':
      mnemonic = args[++i];
      break;
    case '--include-keys':
      includeKeys = true;
      break;
    default:
      if (!outPath) outPath = args[i];
  }
}

async function main() {
  let wallet;
  if (seed) {
    wallet = deriveWalletFromSeed(seed, index, prefix);
  } else if (mnemonic) {
    wallet = deriveWalletFromMnemonic(mnemonic, index, prefix);
  } else {
    wallet = await generateWallet(index, prefix);
  }

  const addresses = includeKeys
    ? deriveAddressRecords(wallet.seed, count, index, prefix)
    : deriveAddresses(wallet.seed, count, index, prefix);

  if (outPath) {
    const file = path.resolve(outPath);
    fs.writeFileSync(file, JSON.stringify({ ...wallet, addresses }, null, 2));
    console.log(`Wallet written to ${file}`);
  } else {
    console.log(`Seed: ${wallet.seed}`);
    console.log(`Mnemonic: ${wallet.mnemonic}`);
    console.log(`Addresses:`);
    if (includeKeys) {
      addresses.forEach((rec) => {
        console.log(`  [${rec.index}] ${rec.address}`);
        console.log(`    Public Key: ${rec.publicKey}`);
        console.log(`    Secret Key: ${rec.secretKey}`);
      });
    } else {
      addresses.forEach((addr, i) => {
        console.log(`  [${index + i}] ${addr}`);
      });
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
