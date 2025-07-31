async function updateNetworkStatus() {
  const statusEl = document.getElementById('network-status');
  const blockEl = document.getElementById('block-count');
  if (!statusEl || !blockEl) return;
  try {
    statusEl.textContent = 'checking...';
    blockEl.textContent = '...';
    const resp = await fetch('https://rpc.nyano.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'block_count' }),
    });
    if (!resp.ok) throw new Error('network');
    const data = await resp.json();
    const count = data.count;
    statusEl.textContent = 'online';
    blockEl.textContent = count;
    localStorage.setItem(
      'network-status',
      JSON.stringify({ status: 'online', count, ts: Date.now() }),
    );
  } catch (err) {
    statusEl.textContent = 'offline';
    const cached = localStorage.getItem('network-status');
    if (cached) {
      try {
        const { count } = JSON.parse(cached);
        blockEl.textContent = `${count} (cached)`;
      } catch {
        blockEl.textContent = '-';
      }
    } else {
      blockEl.textContent = '-';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNetworkStatus();
  setInterval(updateNetworkStatus, 60000);
});
