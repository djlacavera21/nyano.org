function updatePrice(value) {
  const priceEl = document.getElementById('nano-price');
  if (priceEl) priceEl.textContent = value;
}

async function fetchCoingeckoPrice() {
  const resp = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=nano&vs_currencies=usd',
  );
  if (!resp.ok) throw new Error('network');
  const data = await resp.json();
  return data.nano.usd.toFixed(2);
}

async function fetchFallbackPrice() {
  const resp = await fetch(
    'https://api.coinpaprika.com/v1/tickers/nano?quotes=USD',
  );
  if (!resp.ok) throw new Error('network');
  const data = await resp.json();
  return Number(data.quotes.USD.price).toFixed(2);
}

async function fetchPrice() {
  const priceEl = document.getElementById('nano-price');
  if (!priceEl) return;
  priceEl.textContent = 'loading...';
  try {
    const price = await fetchCoingeckoPrice();
    updatePrice(price);
    localStorage.setItem('nano-price', price);
  } catch (err) {
    try {
      const price = await fetchFallbackPrice();
      updatePrice(price);
      localStorage.setItem('nano-price', price);
    } catch (err2) {
      const cached = localStorage.getItem('nano-price');
      if (cached) {
        updatePrice(`${cached} (cached)`);
      } else {
        updatePrice('n/a');
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cached = localStorage.getItem('nano-price');
  if (cached) updatePrice(cached);
  fetchPrice();
  setInterval(fetchPrice, 60000);
});
