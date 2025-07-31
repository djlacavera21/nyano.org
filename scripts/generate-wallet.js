#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  generateWallet,
  deriveWalletFromSeed,
  deriveWalletFromMnemonic,
  deriveAddresses,
  deriveSecretKeyFromSeed,
  derivePublicKeyFromSeed,
  encryptSeed,
} = require('../lib/wallet');

let outPath;
let index = 0;
let prefix = 'nano_';
let count = 1;
let showKeys = false;
let seed;
let mnemonic;
let password;

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
    case '--keys':
      showKeys = true;
      break;
    case '--seed':
      seed = args[++i];
      break;
    case '--mnemonic':
      mnemonic = args[++i];
      break;
    case '--password':
      password = args[++i];
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

  const addresses = deriveAddresses(wallet.seed, count, index, prefix);

  if (outPath) {
    const file = path.resolve(outPath);
    const data = { ...wallet, addresses };
    if (password) {
      data.encryptedSeed = encryptSeed(wallet.seed, password);
      delete data.seed;
    }
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`Wallet written to ${file}`);
  } else {
    if (password) {
      console.log(`Encrypted Seed: ${encryptSeed(wallet.seed, password)}`);
    } else {
      console.log(`Seed: ${wallet.seed}`);
    }
    console.log(`Mnemonic: ${wallet.mnemonic}`);
    console.log(`Addresses:`);
    addresses.forEach((addr, i) => {
      const line = [`  [${index + i}] ${addr}`];
      if (showKeys) {
        const sk = deriveSecretKeyFromSeed(wallet.seed, index + i);
        const pk = derivePublicKeyFromSeed(wallet.seed, index + i);
        line.push(`\n    Secret: ${sk}\n    Public: ${pk}`);
      }
      console.log(line.join(''));
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
