async function updateNetworkStatus() {
  const statusEl = document.getElementById('network-status');
  const blockEl = document.getElementById('block-count');
  const latencyEl = document.getElementById('network-latency');
  if (!statusEl || !blockEl) return;
  try {
    statusEl.textContent = 'checking...';
    blockEl.textContent = '...';
    if (latencyEl) latencyEl.textContent = '...';
    const start = performance.now();
    const resp = await fetch('https://rpc.nyano.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'block_count' }),
    });
    const latency = Math.round(performance.now() - start);
    if (!resp.ok) throw new Error('network');
    const data = await resp.json();
    const count = data.count;
    statusEl.textContent = 'online';
    blockEl.textContent = count;
    if (latencyEl) latencyEl.textContent = `${latency} ms`;
    localStorage.setItem(
      'network-status',
      JSON.stringify({ status: 'online', count, latency, ts: Date.now() }),
    );
  } catch (err) {
    statusEl.textContent = 'offline';
    const cached = localStorage.getItem('network-status');
    if (cached) {
      try {
        const { count, latency } = JSON.parse(cached);
        blockEl.textContent = `${count} (cached)`;
        if (latencyEl)
          latencyEl.textContent = latency ? `${latency} ms (cached)` : '-';
      } catch {
        blockEl.textContent = '-';
        if (latencyEl) latencyEl.textContent = '-';
      }
    } else {
      blockEl.textContent = '-';
      if (latencyEl) latencyEl.textContent = '-';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNetworkStatus();
  setInterval(updateNetworkStatus, 60000);
});
