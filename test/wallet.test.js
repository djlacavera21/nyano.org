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

  const sk = wallet.deriveSecretKeyFromMnemonic(w.mnemonic);
  const pk = wallet.derivePublicKeyFromMnemonic(w.mnemonic);
  assert(wallet.validateSecretKey(sk));
  assert.strictEqual(typeof pk, 'string');

  const addresses = wallet.deriveAddresses(w.seed, 2, 0, 'nano_');
  assert.strictEqual(addresses.length, 2);

  console.log('All wallet tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
