async function fetchPrice() {
  const priceEl = document.getElementById('nano-price');
  if (!priceEl) return;
  try {
    priceEl.textContent = 'loading...';
    const resp = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=nano&vs_currencies=usd',
    );
    if (!resp.ok) throw new Error('network');
    const data = await resp.json();
    priceEl.textContent = data.nano.usd.toFixed(2);
  } catch (err) {
    priceEl.textContent = 'n/a';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchPrice();
  setInterval(fetchPrice, 60000);
});
