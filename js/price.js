function updatePrice(value) {
  const priceEl = document.getElementById('nano-price');
  if (priceEl) priceEl.textContent = value;
}

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
    const price = data.nano.usd.toFixed(2);
    updatePrice(price);
    localStorage.setItem('nano-price', price);
  } catch (err) {
    const cached = localStorage.getItem('nano-price');
    if (cached) {
      updatePrice(`${cached} (cached)`);
    } else {
      updatePrice('n/a');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cached = localStorage.getItem('nano-price');
  if (cached) updatePrice(cached);
  fetchPrice();
  setInterval(fetchPrice, 60000);
});
