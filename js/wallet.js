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
window.generateWallet = generateWallet;

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

function downloadWallet() {
  const seed = document.getElementById('seed').textContent;
  const address = document.getElementById('address').textContent;
  const blob = new Blob([JSON.stringify({ seed, address }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wallet.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('generate-btn')
    .addEventListener('click', generateWallet);
  document
    .getElementById('copy-seed-btn')
    .addEventListener('click', () =>
      copyToClipboard(document.getElementById('seed').textContent),
    );
  document
    .getElementById('copy-address-btn')
    .addEventListener('click', () =>
      copyToClipboard(document.getElementById('address').textContent),
    );
  document
    .getElementById('download-btn')
    .addEventListener('click', downloadWallet);
  generateWallet();
});
