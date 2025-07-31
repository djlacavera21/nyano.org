window.addEventListener('DOMContentLoaded', () => {
  const sidebarItems = document.querySelectorAll('#sidebar li');
  const pages = document.querySelectorAll('.page');
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggle-sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

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

  // Seed and network settings
  const seedInput = document.getElementById('seed-input');
  const toggleSeedBtn = document.getElementById('toggle-seed');
  const generateSeedBtn = document.getElementById('generate-seed');
  const saveSeedBtn = document.getElementById('save-seed');
  const networkSelect = document.getElementById('network-select');
  const rpcInput = document.getElementById('rpc-url');
  const saveRpcBtn = document.getElementById('save-rpc');
  const indexInput = document.getElementById('account-index');
  const saveIndexBtn = document.getElementById('save-account-index');
  const currentIndexEl = document.getElementById('current-index');

  const storedSeed = localStorage.getItem('seed') || '';
  if (seedInput) seedInput.value = storedSeed;
  const storedNetwork = localStorage.getItem('network') || 'mainnet';
  if (networkSelect) networkSelect.value = storedNetwork;
  const storedRpc = localStorage.getItem('rpcUrl') || 'https://rpc.nyano.org';
  if (rpcInput) rpcInput.value = storedRpc;
  const storedIndex = parseInt(localStorage.getItem('accountIndex') || '0', 10);
  if (indexInput) indexInput.value = storedIndex;

  let accountIndex = storedIndex;

  const updateAddress = () => {
    if (!seedInput) return;
    const seed = seedInput.value.trim();
    if (!seed) return;
    const addr = window.nyano.deriveAddress(seed, accountIndex);
    address = addr;
    if (addressEl) addressEl.value = addr;
    if (currentIndexEl) currentIndexEl.textContent = accountIndex;
    if (qrCanvas && typeof QRCode !== 'undefined') {
      QRCode.toCanvas(qrCanvas, addr, { margin: 1 }, () => {});
    }
    fetchBalance();
  };

  if (toggleSeedBtn && seedInput) {
    toggleSeedBtn.addEventListener('click', () => {
      seedInput.type = seedInput.type === 'password' ? 'text' : 'password';
    });
  }

  if (generateSeedBtn && seedInput) {
    generateSeedBtn.addEventListener('click', () => {
      seedInput.value = window.nyano.generateSeed();
    });
  }

  if (saveSeedBtn && seedInput) {
    saveSeedBtn.addEventListener('click', () => {
      localStorage.setItem('seed', seedInput.value.trim());
      updateAddress();
    });
  }

  if (networkSelect) {
    networkSelect.addEventListener('change', () => {
      localStorage.setItem('network', networkSelect.value);
    });
  }

  if (saveRpcBtn && rpcInput) {
    saveRpcBtn.addEventListener('click', () => {
      localStorage.setItem('rpcUrl', rpcInput.value.trim());
    });
  }

  if (saveIndexBtn && indexInput) {
    saveIndexBtn.addEventListener('click', () => {
      accountIndex = parseInt(indexInput.value, 10) || 0;
      localStorage.setItem('accountIndex', accountIndex.toString());
      updateAddress();
    });
  }

  if (currentIndexEl) {
    currentIndexEl.textContent = accountIndex;
  }

  const getRpcUrl = () => (rpcInput ? rpcInput.value.trim() : storedRpc);

  const fetchBalance = async () => {
    if (!balanceEl) return;
    balanceEl.textContent = '...';
    try {
      const resp = await fetch(getRpcUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'account_balance', account: address })
      });
      const data = await resp.json();
      if (data && data.balance) {
        const raw = BigInt(data.balance);
        const nyano = Number(raw) / 1e30;
        balanceEl.textContent = nyano.toString();
      } else {
        balanceEl.textContent = '0';
      }
    } catch (err) {
      balanceEl.textContent = 'error';
    }
  };

  // Wallet data
  let address = storedSeed
    ? window.nyano.deriveAddress(storedSeed, accountIndex)
    : "nyano_11111111111111111111111111111111111111111111111111111111111";
  const balanceEl = document.getElementById('balance');
  const addressEl = document.getElementById('address');
  const qrCanvas = document.getElementById('address-qr');
  if (addressEl) {
    addressEl.value = address;
  }
  if (balanceEl) {
    balanceEl.textContent = '0';
  }
  if (qrCanvas && typeof QRCode !== 'undefined') {
    QRCode.toCanvas(qrCanvas, address, { margin: 1 }, function () {});
  }
  if (storedSeed) updateAddress();
  else fetchBalance();

  const copyBtn = document.getElementById('copy-address');
  const refreshBalanceBtn = document.getElementById('refresh-balance');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      updateAddress();
      navigator.clipboard.writeText(address).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = ''), 1000);
      });
    });
  }
  if (refreshBalanceBtn) {
    refreshBalanceBtn.addEventListener('click', fetchBalance);
  }

  const sendBtn = document.getElementById('send-button');
  const historyTable = document.getElementById('history-table');
  const clearHistoryBtn = document.getElementById('clear-history');
  const exportHistoryBtn = document.getElementById('export-history');
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

  const exportHistory = () => {
    if (!history.length) return;
    const header = 'to,amount,date\n';
    const rows = history
      .map(tx => `${tx.to},${tx.amount},${tx.date}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'history.csv';
    a.click();
    URL.revokeObjectURL(url);
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

  if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener('click', exportHistory);
  }

  // Contacts
  const contactsTable = document.getElementById('contacts-table');
  const addContactBtn = document.getElementById('add-contact');
  const importContactsBtn = document.getElementById('import-contacts');
  const exportContactsBtn = document.getElementById('export-contacts');
  const importFileInput = document.getElementById('import-file');
  const contactNameInput = document.getElementById('contact-name');
  const contactAddressInput = document.getElementById('contact-address');
  let contacts = [];

  const loadContacts = () => {
    try {
      const stored = localStorage.getItem('contacts');
      contacts = stored ? JSON.parse(stored) : [];
    } catch {
      contacts = [];
    }
  };

  const saveContacts = () => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  };

  const renderContacts = () => {
    if (!contactsTable) return;
    const tbody = contactsTable.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    contacts.forEach((c, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${c.name}</td><td>${c.address}</td><td><button data-idx="${i}" class="use-contact">Use</button> <button data-idx="${i}" class="edit-contact">Edit</button> <button data-idx="${i}" class="delete-contact">Delete</button></td>`;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll('.use-contact').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = e.target.getAttribute('data-idx');
        const addr = contacts[idx].address;
        const sendInput = document.getElementById('send-to');
        if (sendInput) sendInput.value = addr;
        sidebarItems.forEach(i => {
          if (i.getAttribute('data-page') === 'wallet') i.click();
        });
      });
    });

    tbody.querySelectorAll('.edit-contact').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = e.target.getAttribute('data-idx');
        const c = contacts[idx];
        const name = prompt('Edit name', c.name);
        if (name === null) return;
        const addr = prompt('Edit address', c.address);
        if (addr === null) return;
        contacts[idx] = { name: name.trim(), address: addr.trim() };
        saveContacts();
        renderContacts();
      });
    });

    tbody.querySelectorAll('.delete-contact').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = e.target.getAttribute('data-idx');
        contacts.splice(idx, 1);
        saveContacts();
        renderContacts();
      });
    });
  };

  loadContacts();
  renderContacts();

  if (addContactBtn) {
    addContactBtn.addEventListener('click', () => {
      const name = contactNameInput.value.trim();
      const addr = contactAddressInput.value.trim();
      if (!name || !addr) return;
      contacts.push({ name, address: addr });
      saveContacts();
      renderContacts();
      contactNameInput.value = '';
      contactAddressInput.value = '';
    });
  }

  const exportContacts = () => {
    if (!contacts.length) return;
    const blob = new Blob([JSON.stringify(contacts, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importContacts = files => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) {
          data.forEach(c => {
            if (c.name && c.address) {
              contacts.push({ name: c.name, address: c.address });
            }
          });
          saveContacts();
          renderContacts();
        }
      } catch {}
    };
    reader.readAsText(file);
  };

  if (exportContactsBtn) {
    exportContactsBtn.addEventListener('click', exportContacts);
  }

  if (importContactsBtn && importFileInput) {
    importContactsBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', e => {
      importContacts(e.target.files);
      importFileInput.value = '';
    });
  }

  // Miner controls
  let mining = false;
  let startTime = 0;
  let timerInterval;
  const statusEl = document.getElementById('miner-status');
  const timerEl = document.getElementById('miner-timer');
  const startBtn = document.getElementById('start-miner');
  const stopBtn = document.getElementById('stop-miner');

  const updateTimer = () => {
    if (!timerEl) return;
    if (!mining) {
      timerEl.textContent = '0s';
    } else {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      timerEl.textContent = diff + 's';
    }
  };

  const updateMinerUI = () => {
    if (statusEl) statusEl.textContent = mining ? 'running' : 'stopped';
    if (startBtn) startBtn.disabled = mining;
    if (stopBtn) stopBtn.disabled = !mining;
    updateTimer();
  };

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      mining = true;
      startTime = Date.now();
      clearInterval(timerInterval);
      timerInterval = setInterval(updateTimer, 1000);
      updateMinerUI();
    });
  }
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      mining = false;
      clearInterval(timerInterval);
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
    } catch (err) {
      if (priceEl) priceEl.textContent = 'error';
    }
    try {
      const rpcResp = await fetch(getRpcUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'version' })
      });
      await rpcResp.json();
      if (networkEl) networkEl.textContent = 'online';
    } catch (err) {
      if (networkEl) networkEl.textContent = 'offline';
    }
  };

  if (refreshBtn) {
    refreshBtn.addEventListener('click', fetchDashboard);
  }

  fetchDashboard();
});

