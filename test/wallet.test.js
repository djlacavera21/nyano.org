const assert = require('assert');
const wallet = require('../lib/wallet');

async function run() {
  const w = await wallet.generateWallet(0, 'nano_');
  assert(wallet.validateSeed(w.seed));
  assert(wallet.validateMnemonic(w.mnemonic));
  assert(wallet.validateAddress(w.address));

  const fromSeed = wallet.deriveWalletFromSeed(w.seed);
  const fromMnemonic = wallet.deriveWalletFromMnemonic(w.mnemonic);
  assert.strictEqual(fromSeed.address, w.address);
  assert.strictEqual(fromMnemonic.address, w.address);

  const fromMnemonicPass = wallet.deriveWalletFromMnemonic(
    w.mnemonic,
    0,
    'nano_',
    'passphrase',
  );
  const seedPass = wallet.seedFromMnemonic(w.mnemonic, 'passphrase');
  const fromSeedPass = wallet.deriveWalletFromSeed(seedPass);
  assert.strictEqual(fromMnemonicPass.address, fromSeedPass.address);
  assert.notStrictEqual(fromMnemonicPass.address, w.address);

  const sk = wallet.deriveSecretKeyFromMnemonic(w.mnemonic);
  const pk = wallet.derivePublicKeyFromMnemonic(w.mnemonic);
  assert(wallet.validateSecretKey(sk));
  assert.strictEqual(typeof pk, 'string');

  const addresses = wallet.deriveAddresses(w.seed, 2, 0, 'nano_');
  assert.strictEqual(addresses.length, 2);

  const encrypted = wallet.encryptSeed(w.seed, 'pass');
  const decrypted = wallet.decryptSeed(encrypted, 'pass');
  assert.strictEqual(decrypted, w.seed);

  const tmp = require('os').tmpdir();
  const path = require('path');
  const fs = require('fs');
  const file = path.join(tmp, 'wallet.json');
  wallet.saveWalletToFile(w, file, 'secret');
  const loaded = wallet.loadWalletFromFile(file, 'secret');
  assert.strictEqual(loaded.address, w.address);
  fs.unlinkSync(file);

  console.log('All wallet tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
