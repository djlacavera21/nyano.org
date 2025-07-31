const { generateSeed, deriveAddress } = require('nanocurrency');
const bip39 = require('bip39');

function generateWallet(index = 0, prefix = 'nano_') {
  const seed = generateSeed();
  const mnemonic = bip39.entropyToMnemonic(seed);
  const address = deriveAddress(seed, index, { prefix });
  return { seed, mnemonic, address };
}

module.exports = { generateWallet };
