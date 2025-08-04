/* global QRCode */
window.addEventListener('DOMContentLoaded', async () => {
  const sidebarItems = document.querySelectorAll('#sidebar li');
  const pages = document.querySelectorAll('.page');
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggle-sidebar');
  let currentPage = localStorage.getItem('currentPage') || 'wallet';
  const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (collapsed && sidebar) sidebar.classList.add('collapsed');

  sidebarItems.forEach((item) => {
    item.classList.toggle(
      'active',
      item.getAttribute('data-page') === currentPage,
    );
  });
  pages.forEach((page) => {
    page.classList.toggle('active', page.id === currentPage);
  });
  if (currentPage === 'wallet') {
    fetchBalance();
    fetchNetworkHistory();
  } else if (currentPage === 'dashboard') {
    fetchDashboard();
  }

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem(
        'sidebarCollapsed',
        sidebar.classList.contains('collapsed').toString(),
      );
    });
  }

  sidebarItems.forEach((item) => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-page');

      sidebarItems.forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      pages.forEach((page) => {
        page.classList.toggle('active', page.id === target);
      });

      currentPage = target;
      localStorage.setItem('currentPage', currentPage);
      if (currentPage === 'wallet') {
        fetchBalance();
        fetchNetworkHistory();
      } else if (currentPage === 'dashboard') {
        fetchDashboard();
      }
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
  const exportSeedBtn = document.getElementById('export-seed');
  const importSeedBtn = document.getElementById('import-seed');
  const seedFileInput = document.getElementById('seed-file');
  const passwordInput = document.getElementById('password-input');
  const setPasswordBtn = document.getElementById('set-password');
  const unlockWalletBtn = document.getElementById('unlock-wallet');
  const networkSelect = document.getElementById('network-select');
  const currentNetworkEl = document.getElementById('current-network');
  const rpcInput = document.getElementById('rpc-url');
  const saveRpcBtn = document.getElementById('save-rpc');
  const indexInput = document.getElementById('account-index');
  const saveIndexBtn = document.getElementById('save-account-index');
  const currentIndexEl = document.getElementById('current-index');
  const exportSettingsBtn = document.getElementById('export-settings');
  const importSettingsBtn = document.getElementById('import-settings');
  const resetSettingsBtn = document.getElementById('reset-settings');
  const settingsFileInput = document.getElementById('settings-file');
  const startNodeBtn = document.getElementById('start-node');
  const stopNodeBtn = document.getElementById('stop-node');
  const nodeStatusEl = document.getElementById('node-status');
  const autoStartNodeToggle = document.getElementById('auto-start-node');

  const updateNodeControls = async () => {
    const running = await window.nyano.nodeStatus();
    if (nodeStatusEl)
      nodeStatusEl.textContent = running ? 'running' : 'stopped';
    if (startNodeBtn) startNodeBtn.disabled = running;
    if (stopNodeBtn) stopNodeBtn.disabled = !running;
  };

  if (startNodeBtn) {
    startNodeBtn.addEventListener('click', async () => {
      await window.nyano.startNode();
      updateNodeControls();
    });
  }

  if (stopNodeBtn) {
    stopNodeBtn.addEventListener('click', async () => {
      await window.nyano.stopNode();
      updateNodeControls();
    });
  }

  if (autoStartNodeToggle) {
    const autoStart = localStorage.getItem('autoStartNode') === 'true';
    autoStartNodeToggle.checked = autoStart;
    autoStartNodeToggle.addEventListener('change', async () => {
      const enabled = autoStartNodeToggle.checked;
      localStorage.setItem('autoStartNode', enabled.toString());
      if (enabled) {
        await window.nyano.startNode();
      } else {
        await window.nyano.stopNode();
      }
      updateNodeControls();
    });
    if (autoStart) {
      await window.nyano.startNode();
    }
  }

  updateNodeControls();

  const encryptedSeed = localStorage.getItem('encryptedSeed');
  const storedSeed = encryptedSeed ? '' : localStorage.getItem('seed') || '';
  if (seedInput) {
    seedInput.value = storedSeed;
    if (encryptedSeed && !storedSeed) seedInput.disabled = true;
  }
  const storedNetwork = localStorage.getItem('network') || 'mainnet';
  if (networkSelect) networkSelect.value = storedNetwork;
  if (currentNetworkEl) currentNetworkEl.textContent = storedNetwork;
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
    const nanoAddr = window.nyano.deriveNanoAddress(seed, accountIndex);
    address = addr;
    nanoAddress = nanoAddr;
    if (addressEl) addressEl.value = addr;
    if (nanoAddressEl) nanoAddressEl.value = nanoAddr;
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
      const val = seedInput.value.trim();
      if (!val) return;
      if (localStorage.getItem('encryptedSeed')) {
        if (!passwordInput || !passwordInput.value) {
          alert('Enter password to save');
          return;
        }
        const enc = window.nyano.encryptSeed(val, passwordInput.value);
        localStorage.setItem('encryptedSeed', enc);
        localStorage.removeItem('seed');
      } else {
        localStorage.setItem('seed', val);
      }
      updateAddress();
    });
  }

  const exportSeed = () => {
    if (!seedInput) return;
    const seed = seedInput.value.trim();
    if (!seed) return;
    const blob = new Blob([seed], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nyano-seed.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSeed = (files) => {
    const file = files[0];
    if (!file || !seedInput) return;
    const reader = new FileReader();
    reader.onload = () => {
      seedInput.value = (reader.result || '').trim();
      const val = seedInput.value;
      if (localStorage.getItem('encryptedSeed')) {
        if (!passwordInput || !passwordInput.value) {
          alert('Enter password to import');
          return;
        }
        const enc = window.nyano.encryptSeed(val, passwordInput.value);
        localStorage.setItem('encryptedSeed', enc);
        localStorage.removeItem('seed');
      } else {
        localStorage.setItem('seed', val);
      }
      updateAddress();
    };
    reader.readAsText(file);
  };

  if (exportSeedBtn) {
    exportSeedBtn.addEventListener('click', exportSeed);
  }

  if (importSeedBtn && seedFileInput) {
    importSeedBtn.addEventListener('click', () => seedFileInput.click());
    seedFileInput.addEventListener('change', (e) => {
      importSeed(e.target.files);
      seedFileInput.value = '';
    });
  }

  if (setPasswordBtn && passwordInput && seedInput) {
    setPasswordBtn.addEventListener('click', () => {
      const pw = passwordInput.value.trim();
      const seed = seedInput.value.trim();
      if (!pw || !seed) return;
      const enc = window.nyano.encryptSeed(seed, pw);
      localStorage.setItem('encryptedSeed', enc);
      localStorage.removeItem('seed');
      seedInput.value = '';
      seedInput.disabled = true;
      alert('Wallet locked');
    });
  }

  if (unlockWalletBtn && passwordInput && seedInput) {
    unlockWalletBtn.addEventListener('click', () => {
      const pw = passwordInput.value.trim();
      const enc = localStorage.getItem('encryptedSeed');
      if (!pw || !enc) return;
      const dec = window.nyano.decryptSeed(enc, pw);
      if (!dec) {
        alert('Invalid password');
        return;
      }
      seedInput.disabled = false;
      seedInput.value = dec;
      updateAddress();
      alert('Wallet unlocked');
    });
  }

  const exportSettings = () => {
    const data = {
      seed: localStorage.getItem('seed') || '',
      encryptedSeed: localStorage.getItem('encryptedSeed') || '',
      network: localStorage.getItem('network') || 'mainnet',
      rpcUrl: localStorage.getItem('rpcUrl') || 'https://rpc.nyano.org',
      accountIndex: parseInt(localStorage.getItem('accountIndex') || '0', 10),
      autoStartNode: localStorage.getItem('autoStartNode') === 'true',
      contacts: JSON.parse(localStorage.getItem('contacts') || '[]'),
      history: JSON.parse(localStorage.getItem('history') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nyano-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (files) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.encryptedSeed) {
          localStorage.setItem('encryptedSeed', data.encryptedSeed);
          localStorage.removeItem('seed');
          if (seedInput) {
            seedInput.value = '';
            seedInput.disabled = true;
          }
        } else if (data.seed !== undefined) {
          localStorage.setItem('seed', data.seed);
          if (seedInput) seedInput.value = data.seed;
        }
        if (data.network) {
          localStorage.setItem('network', data.network);
          if (networkSelect) networkSelect.value = data.network;
        }
        if (data.rpcUrl) {
          localStorage.setItem('rpcUrl', data.rpcUrl);
          if (rpcInput) rpcInput.value = data.rpcUrl;
        }
        if (typeof data.accountIndex === 'number') {
          accountIndex = data.accountIndex;
          localStorage.setItem('accountIndex', accountIndex.toString());
          if (indexInput) indexInput.value = accountIndex;
        }
        if (typeof data.autoStartNode === 'boolean') {
          localStorage.setItem('autoStartNode', data.autoStartNode.toString());
          if (autoStartNodeToggle) {
            autoStartNodeToggle.checked = data.autoStartNode;
          }
        }
        if (Array.isArray(data.contacts)) {
          contacts = data.contacts;
          saveContacts();
          renderContacts();
        }
        if (Array.isArray(data.history)) {
          history = data.history;
          saveHistory();
          renderHistory();
        }
        updateAddress();
      } catch {}
    };
    reader.readAsText(file);
  };

  const resetSettings = () => {
    localStorage.clear();
    if (seedInput) seedInput.value = '';
    if (seedInput) seedInput.disabled = false;
    if (networkSelect) networkSelect.value = 'mainnet';
    if (rpcInput) rpcInput.value = 'https://rpc.nyano.org';
    if (autoStartNodeToggle) autoStartNodeToggle.checked = false;
    accountIndex = 0;
    if (indexInput) indexInput.value = '0';
    contacts = [];
    history = [];
    saveContacts();
    saveHistory();
    renderContacts();
    renderHistory();
    updateAddress();
    window.nyano.stopNode();
    updateNodeControls();
  };

  if (networkSelect) {
    networkSelect.addEventListener('change', () => {
      localStorage.setItem('network', networkSelect.value);
      if (currentNetworkEl) currentNetworkEl.textContent = networkSelect.value;
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

  async function fetchBalance() {
    if (!balanceEl) return;
    balanceEl.textContent = '...';
    try {
      const resp = await fetch(getRpcUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'account_balance', account: address }),
      });
      const data = await resp.json();
      if (data && data.balance) {
        const nyano = window.nyano.convert(data.balance, {
          from: window.nyano.Unit.raw,
          to: window.nyano.Unit.nano,
        });
        balanceEl.textContent = nyano;
      } else {
        balanceEl.textContent = '0';
      }
    } catch (err) {
      balanceEl.textContent = 'error';
    }
  }

  async function receivePending() {
    if (!seedInput || !seedInput.value.trim()) {
      alert('No seed configured');
      return;
    }
    updateAddress();
    const rpcUrl = getRpcUrl();
    const seed = seedInput.value.trim();
    const secretKey = window.nyano.deriveSecretKey(seed, accountIndex);
    const publicKey = window.nyano.derivePublicKey(secretKey);
    try {
      const pendingResp = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pending',
          account: address,
          count: 20,
        }),
      });
      const pendingData = await pendingResp.json();
      const hashes = Object.keys(pendingData.blocks || {});
      if (!hashes.length) {
        alert('No pending blocks');
        return;
      }
      const infoResp = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'account_info', account: address }),
      });
      const info = await infoResp.json();
      let previous = info.frontier || null;
      const representative = info.representative || address;
      let balanceRaw = BigInt(info.balance || '0');
      for (const hash of hashes) {
        const blockInfoResp = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'block_info', hash }),
        });
        const blockInfo = await blockInfoResp.json();
        const amountRaw = BigInt(blockInfo.amount || '0');
        const workHash = previous || publicKey;
        const workResp = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'work_generate', hash: workHash }),
        });
        const workData = await workResp.json();
        if (!workData.work) continue;
        balanceRaw += amountRaw;
        const blockData = {
          previous,
          representative,
          balance: balanceRaw.toString(),
          link: hash,
          work: workData.work,
        };
        const { block } = window.nyano.createBlock(secretKey, blockData);
        const procResp = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'process',
            json_block: 'true',
            subtype: previous ? 'receive' : 'open',
            block,
          }),
        });
        const proc = await procResp.json();
        if (proc.hash) {
          previous = proc.hash;
        } else {
          break;
        }
      }
      fetchBalance();
      fetchNetworkHistory();
    } catch (err) {
      alert('Error receiving');
    }
  }

  // Wallet data
  let address = storedSeed
    ? window.nyano.deriveAddress(storedSeed, accountIndex)
    : 'nyano_11111111111111111111111111111111111111111111111111111111111';
  let nanoAddress = storedSeed
    ? window.nyano.deriveNanoAddress(storedSeed, accountIndex)
    : 'nano_11111111111111111111111111111111111111111111111111111111111';
  const balanceEl = document.getElementById('balance');
  const addressEl = document.getElementById('address');
  const nanoAddressEl = document.getElementById('nano-address');
  const qrCanvas = document.getElementById('address-qr');
  if (addressEl) {
    addressEl.value = address;
  }
  if (nanoAddressEl) {
    nanoAddressEl.value = nanoAddress;
  }
  if (balanceEl) {
    balanceEl.textContent = '0';
  }
  if (qrCanvas && typeof QRCode !== 'undefined') {
    QRCode.toCanvas(qrCanvas, address, { margin: 1 }, function () {});
  }
  if (storedSeed) updateAddress();
  else if (!encryptedSeed) fetchBalance();

  const copyBtn = document.getElementById('copy-address');
  const copyNanoBtn = document.getElementById('copy-nano-address');
  const viewAddrBtn = document.getElementById('view-address');
  const refreshBalanceBtn = document.getElementById('refresh-balance');
  const receivePendingBtn = document.getElementById('receive-pending');
  const saveQrBtn = document.getElementById('save-address-qr');
  const sendMaxBtn = document.getElementById('send-max');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      updateAddress();
      navigator.clipboard.writeText(address).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = ''), 1000);
      });
    });
  }
  if (copyNanoBtn) {
    copyNanoBtn.addEventListener('click', () => {
      updateAddress();
      const nanoAddr = nanoAddressEl ? nanoAddressEl.value : '';
      navigator.clipboard.writeText(nanoAddr).then(() => {
        copyNanoBtn.textContent = 'Copied!';
        setTimeout(() => (copyNanoBtn.textContent = ''), 1000);
      });
    });
  }
  if (viewAddrBtn) {
    viewAddrBtn.addEventListener('click', () => {
      updateAddress();
      window.nyano.openExternal(`https://nyanoscan.org/account/${address}`);
    });
  }
  if (refreshBalanceBtn) {
    refreshBalanceBtn.addEventListener('click', fetchBalance);
  }
  if (receivePendingBtn) {
    receivePendingBtn.addEventListener('click', receivePending);
  }
  if (saveQrBtn && qrCanvas) {
    saveQrBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = qrCanvas.toDataURL('image/png');
      link.download = 'nyano-address.png';
      link.click();
    });
  }
  if (sendMaxBtn && balanceEl) {
    sendMaxBtn.addEventListener('click', () => {
      const amtInput = document.getElementById('send-amount');
      if (amtInput) amtInput.value = balanceEl.textContent || '0';
    });
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
    const header = 'to,amount,date,hash\n';
    const rows = history
      .map((tx) => `${tx.to},${tx.amount},${tx.date},${tx.hash || ''}`)
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
    history.forEach((tx) => {
      const row = document.createElement('tr');
      const hashCell = tx.hash
        ? `<a href="#" data-hash="${tx.hash}">${tx.hash}</a>`
        : '';
      row.innerHTML = `<td>${tx.to}</td><td>${tx.amount}</td><td>${tx.date}</td><td>${hashCell}</td>`;
      tbody.appendChild(row);
    });
    tbody.querySelectorAll('a[data-hash]').forEach((link) => {
      link.addEventListener('click', (ev) => {
        ev.preventDefault();
        const h = link.getAttribute('data-hash');
        window.nyano.openExternal(`https://nyanoscan.org/block/${h}`);
      });
    });
  };

  loadHistory();
  renderHistory();

  if (sendBtn) {
    sendBtn.addEventListener('click', async () => {
      const to = document.getElementById('send-to').value.trim();
      const amt = document.getElementById('send-amount').value.trim();
      const status = document.getElementById('tx-status');
      if (!seedInput || !seedInput.value.trim()) {
        status.textContent = 'No seed configured';
        return;
      }
      const amount = parseFloat(amt);
      if (!to || Number.isNaN(amount) || amount <= 0) {
        status.textContent = 'Invalid amount or address';
        return;
      }

      if (!confirm(`Send ${amt} NYANO to ${to}?`)) {
        return;
      }

      status.textContent = 'Sending...';

      const seed = seedInput.value.trim();
      const secretKey = window.nyano.deriveSecretKey(seed, accountIndex);
      const publicKey = window.nyano.derivePublicKey(secretKey);
      const acct = window.nyano.deriveAddress(seed, accountIndex);

      try {
        const rpcUrl = getRpcUrl();
        const infoResp = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'account_info', account: acct }),
        });
        const info = await infoResp.json();
        const previous = info.frontier || null;
        const representative = info.representative || acct;
        const balanceRaw = BigInt(info.balance || '0');
        const sendRaw = BigInt(
          window.nyano.convert(amt, {
            from: window.nyano.Unit.NANO,
            to: window.nyano.Unit.raw,
          }),
        );
        if (sendRaw > balanceRaw) {
          status.textContent = 'Insufficient balance';
          return;
        }
        const newBalance = balanceRaw - sendRaw;
        const workHash = previous || publicKey;
        const workResp = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'work_generate', hash: workHash }),
        });
        const workData = await workResp.json();
        if (!workData.work) {
          status.textContent = 'Failed to generate work';
          return;
        }

        const blockData = {
          previous,
          representative,
          balance: newBalance.toString(),
          link: to,
          work: workData.work,
        };

        const { block } = window.nyano.createBlock(secretKey, blockData);
        const procResp = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'process',
            json_block: 'true',
            subtype: previous ? 'send' : 'open',
            block,
          }),
        });
        const proc = await procResp.json();
        if (proc.hash) {
          status.textContent = `Sent! ${proc.hash}`;
          const tx = {
            to,
            amount: amt,
            date: new Date().toLocaleString(),
            hash: proc.hash,
          };
          history.unshift(tx);
          saveHistory();
          renderHistory();
          fetchBalance();
          fetchNetworkHistory();
        } else {
          status.textContent = 'Transaction failed';
        }
      } catch (err) {
        status.textContent = 'Error sending transaction';
      }
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      if (!confirm('Clear local history?')) return;
      history = [];
      saveHistory();
      renderHistory();
    });
  }

  if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener('click', exportHistory);
  }

  // Network account history
  const networkHistoryTable = document.getElementById('network-history-table');
  const refreshNetworkHistoryBtn = document.getElementById(
    'refresh-network-history',
  );

  const renderNetworkHistory = (entries) => {
    if (!networkHistoryTable) return;
    const tbody = networkHistoryTable.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!Array.isArray(entries) || !entries.length) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="3">No history</td>';
      tbody.appendChild(row);
      return;
    }
    entries.forEach((e) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${e.type}</td><td>${e.amount}</td><td><a href="#" data-hash="${e.hash}">${e.hash}</a></td>`;
      tbody.appendChild(row);
    });
    tbody.querySelectorAll('a[data-hash]').forEach((link) => {
      link.addEventListener('click', (ev) => {
        ev.preventDefault();
        const h = link.getAttribute('data-hash');
        window.nyano.openExternal(`https://nyanoscan.org/block/${h}`);
      });
    });
  };

  async function fetchNetworkHistory() {
    if (!address) return;
    if (networkHistoryTable) {
      const tbody = networkHistoryTable.querySelector('tbody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
    }
    try {
      const resp = await fetch(getRpcUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'account_history',
          account: address,
          count: 20,
          raw: true,
        }),
      });
      const data = await resp.json();
      const entries = (data.history || []).map((h) => ({
        type: h.type,
        amount: Number(h.amount) / 1e30,
        hash: h.hash,
      }));
      renderNetworkHistory(entries);
    } catch (err) {
      renderNetworkHistory([]);
    }
  }

  if (refreshNetworkHistoryBtn) {
    refreshNetworkHistoryBtn.addEventListener('click', fetchNetworkHistory);
  }

  // initial fetch
  fetchNetworkHistory();

  // Contacts
  const contactsTable = document.getElementById('contacts-table');
  const addContactBtn = document.getElementById('add-contact');
  const importContactsBtn = document.getElementById('import-contacts');
  const exportContactsBtn = document.getElementById('export-contacts');
  const importFileInput = document.getElementById('import-file');
  const contactNameInput = document.getElementById('contact-name');
  const contactAddressInput = document.getElementById('contact-address');
  const contactSearchInput = document.getElementById('contact-search');
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
    const search = contactSearchInput
      ? contactSearchInput.value.trim().toLowerCase()
      : '';
    contacts.forEach((c, i) => {
      if (
        search &&
        !c.name.toLowerCase().includes(search) &&
        !c.address.toLowerCase().includes(search)
      )
        return;
      const row = document.createElement('tr');
      row.innerHTML = `<td>${c.name}</td><td>${c.address}</td><td><button data-idx="${i}" class="use-contact">Use</button> <button data-idx="${i}" class="edit-contact">Edit</button> <button data-idx="${i}" class="delete-contact">Delete</button></td>`;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll('.use-contact').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-idx');
        const addr = contacts[idx].address;
        const sendInput = document.getElementById('send-to');
        if (sendInput) sendInput.value = addr;
        sidebarItems.forEach((i) => {
          if (i.getAttribute('data-page') === 'wallet') i.click();
        });
      });
    });

    tbody.querySelectorAll('.edit-contact').forEach((btn) => {
      btn.addEventListener('click', (e) => {
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

    tbody.querySelectorAll('.delete-contact').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-idx');
        contacts.splice(idx, 1);
        saveContacts();
        renderContacts();
      });
    });
  };

  loadContacts();
  renderContacts();

  if (contactSearchInput) {
    contactSearchInput.addEventListener('input', renderContacts);
  }

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
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importContacts = (files) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) {
          data.forEach((c) => {
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
    importFileInput.addEventListener('change', (e) => {
      importContacts(e.target.files);
      importFileInput.value = '';
    });
  }

  if (exportSettingsBtn) {
    exportSettingsBtn.addEventListener('click', exportSettings);
  }

  if (importSettingsBtn && settingsFileInput) {
    importSettingsBtn.addEventListener('click', () =>
      settingsFileInput.click(),
    );
    settingsFileInput.addEventListener('change', (e) => {
      importSettings(e.target.files);
      settingsFileInput.value = '';
    });
  }

  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', () => {
      if (confirm('Reset all data?')) resetSettings();
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
  const consoleEl = document.getElementById('miner-console');

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
    startBtn.addEventListener('click', async () => {
      mining = await window.nyano.startMiner();
      if (!mining) return;
      startTime = Date.now();
      if (consoleEl) consoleEl.textContent = '';
      clearInterval(timerInterval);
      timerInterval = setInterval(updateTimer, 1000);
      updateMinerUI();
    });
  }
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      window.nyano.stopMiner();
    });
  }

  window.nyano.onMinerOutput((data) => {
    if (consoleEl) {
      consoleEl.textContent += data;
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }
  });

  window.nyano.onMinerExit(() => {
    mining = false;
    clearInterval(timerInterval);
    updateMinerUI();
  });

  updateMinerUI();

  // Dashboard data
  const priceEl = document.getElementById('nano-price');
  const networkEl = document.getElementById('network-status');
  const blockCountEl = document.getElementById('block-count');
  const peerCountEl = document.getElementById('peer-count');
  const syncEl = document.getElementById('sync-progress');
  const latencyEl = document.getElementById('rpc-latency');
  const nodeVerEl = document.getElementById('node-version');
  const refreshBtn = document.getElementById('refresh-dashboard');

  async function fetchDashboard() {
    if (priceEl) priceEl.textContent = 'loading...';
    if (networkEl) networkEl.textContent = 'checking...';
    if (blockCountEl) blockCountEl.textContent = '...';
    if (peerCountEl) peerCountEl.textContent = '...';
    if (syncEl) syncEl.textContent = '-';
    if (latencyEl) latencyEl.textContent = '-';
    if (nodeVerEl) nodeVerEl.textContent = '-';
    try {
      const resp = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=nano&vs_currencies=usd',
      );
      const data = await resp.json();
      if (priceEl) priceEl.textContent = data.nano.usd;
    } catch (err) {
      if (priceEl) priceEl.textContent = 'error';
    }
    try {
      const rpcUrl = getRpcUrl();
      const start = performance.now();
      const [versionResp, blockResp, peersResp] = await Promise.all([
        fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'version' }),
        }),
        fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'block_count' }),
        }),
        fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'peers' }),
        }),
      ]);
      const latency = Math.round(performance.now() - start);
      if (latencyEl) latencyEl.textContent = latency + 'ms';

      const verData = await versionResp.json();
      if (networkEl) networkEl.textContent = verData.node_vendor || 'online';
      if (nodeVerEl && verData.rpc_version)
        nodeVerEl.textContent = verData.rpc_version;

      const blockData = await blockResp.json();
      if (blockCountEl && blockData.count !== undefined) {
        blockCountEl.textContent = blockData.count;
      }
      if (
        syncEl &&
        blockData.count !== undefined &&
        blockData.unchecked !== undefined
      ) {
        const count = parseInt(blockData.count, 10);
        const unchecked = parseInt(blockData.unchecked, 10);
        const progress = count
          ? Math.round(((count - unchecked) / count) * 100)
          : 0;
        syncEl.textContent = progress + '%';
      }

      const peersData = await peersResp.json();
      if (peerCountEl && peersData.peers) {
        peerCountEl.textContent = Object.keys(peersData.peers).length;
      }
    } catch (err) {
      if (networkEl) networkEl.textContent = 'offline';
      if (blockCountEl) blockCountEl.textContent = '-';
      if (peerCountEl) peerCountEl.textContent = '-';
      if (syncEl) syncEl.textContent = '-';
      if (latencyEl) latencyEl.textContent = '-';
      if (nodeVerEl) nodeVerEl.textContent = '-';
    }
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', fetchDashboard);
  }

  fetchDashboard();

  setInterval(() => {
    if (currentPage === 'wallet') fetchBalance();
  }, 60000);

  setInterval(() => {
    if (currentPage === 'wallet') fetchNetworkHistory();
  }, 120000);

  setInterval(() => {
    if (currentPage === 'dashboard') fetchDashboard();
  }, 60000);
});
