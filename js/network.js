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
    statusEl.textContent = 'online';
    blockEl.textContent = data.count;
  } catch (err) {
    statusEl.textContent = 'offline';
    blockEl.textContent = '-';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNetworkStatus();
  setInterval(updateNetworkStatus, 60000);
});
