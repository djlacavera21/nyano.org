/* global QRCode */
const { generateSeed, deriveAddress } = window.nanocurrency;
function generateWallet() {
  const seed = generateSeed();
  const address = deriveAddress(seed, 0, { prefix: 'nano_' });
  document.getElementById('seed').textContent = seed;
  document.getElementById('address').textContent = address;
  if (window.QRCode) {
    QRCode.toCanvas(
      document.getElementById('address-qr'),
      address,
      { margin: 1 },
      () => {},
    );
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('generate-btn')
    .addEventListener('click', generateWallet);
  generateWallet();
});
