window.addEventListener('DOMContentLoaded', () => {
  const sidebarItems = document.querySelectorAll('#sidebar li');
  const pages = document.querySelectorAll('.page');

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-page');

      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      pages.forEach(page => {
        page.classList.toggle('active', page.id === target);
      });
    });
  });

  // Populate platform and version info
  const platformEl = document.getElementById('platform');
  if (platformEl) {
    platformEl.textContent = window.nyano.platform;
  }
  const versionEl = document.getElementById('version');
  if (versionEl) {
    versionEl.textContent = window.nyano.version;
  }

  // Setup dark mode toggle
  const darkToggle = document.getElementById('dark-toggle');
  if (darkToggle) {
    const current = localStorage.getItem('theme');
    if (current === 'dark') {
      document.body.classList.add('dark');
      darkToggle.checked = true;
    }
    darkToggle.addEventListener('change', () => {
      const dark = darkToggle.checked;
      document.body.classList.toggle('dark', dark);
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  }

  // Wallet placeholder data
  const address = 'nyano_111111111111111111111111111111111111111111111111111111111111';
  const balanceEl = document.getElementById('balance');
  const addressEl = document.getElementById('address');
  if (addressEl) {
    addressEl.value = address;
  }
  if (balanceEl) {
    balanceEl.textContent = '0';
  }

  const copyBtn = document.getElementById('copy-address');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(address).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = ''), 1000);
      });
    });
  }

  const sendBtn = document.getElementById('send-button');
  const historyTable = document.getElementById('history-table');
  const clearHistoryBtn = document.getElementById('clear-history');
  let history = [];

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('history');
      history = stored ? JSON.parse(stored) : [];
    } catch {
      history = [];
    }
  };

  const saveHistory = () => {
    localStorage.setItem('history', JSON.stringify(history));
  };

  const renderHistory = () => {
    if (!historyTable) return;
    const tbody = historyTable.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    history.forEach(tx => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${tx.to}</td><td>${tx.amount}</td><td>${tx.date}</td>`;
      tbody.appendChild(row);
    });
  };

  loadHistory();
  renderHistory();

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const to = document.getElementById('send-to').value;
      const amt = document.getElementById('send-amount').value;
      const status = document.getElementById('tx-status');
      status.textContent = `Pretending to send ${amt} NYANO to ${to}`;

      const tx = { to, amount: amt, date: new Date().toLocaleString() };
      history.unshift(tx);
      saveHistory();
      renderHistory();
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      history = [];
      saveHistory();
      renderHistory();
    });
  }

  // Miner controls
  let mining = false;
  const statusEl = document.getElementById('miner-status');
  const startBtn = document.getElementById('start-miner');
  const stopBtn = document.getElementById('stop-miner');

  const updateMinerUI = () => {
    if (statusEl) statusEl.textContent = mining ? 'running' : 'stopped';
    if (startBtn) startBtn.disabled = mining;
    if (stopBtn) stopBtn.disabled = !mining;
  };

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      mining = true;
      updateMinerUI();
    });
  }
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      mining = false;
      updateMinerUI();
    });
  }

  updateMinerUI();

  // Dashboard data
  const priceEl = document.getElementById('nano-price');
  const networkEl = document.getElementById('network-status');
  const refreshBtn = document.getElementById('refresh-dashboard');

  const fetchDashboard = async () => {
    if (priceEl) priceEl.textContent = 'loading...';
    if (networkEl) networkEl.textContent = 'checking...';
    try {
      const resp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=nano&vs_currencies=usd');
      const data = await resp.json();
      if (priceEl) priceEl.textContent = data.nano.usd;
      if (networkEl) networkEl.textContent = 'online';
    } catch (err) {
      if (priceEl) priceEl.textContent = 'error';
      if (networkEl) networkEl.textContent = 'offline';
    }
  };

  if (refreshBtn) {
    refreshBtn.addEventListener('click', fetchDashboard);
  }

  fetchDashboard();
});

