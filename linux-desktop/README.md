# Nyano Desktop

This directory contains a small Electron application that acts as the starting
point for a Nyano desktop wallet and miner. The interface uses a left side
navigation bar with separate pages for **Wallet**, **Dashboard**, **Miner**, and
**Settings**. The Dashboard fetches the current Nano price and now also displays
block and peer counts along with sync progress, RPC latency and node version
information pulled from the configured RPC node. The platform
information and application version are exposed via a
preload API and shown on the settings page. The wallet view includes a simple
send form and address display, while the miner page provides start/stop controls.
A dark mode toggle is also available in the settings. Sent transactions are
tracked locally and shown in a simple history table within the wallet view.

Recent updates introduce basic wallet management. You can generate or import a
seed on the **Settings** page and select which network (mainnet, testnet, or
beta) the app should target. The derived Nyano address is displayed in the
wallet view along with a QR code. The currently selected network is also shown
on the wallet page so you always know which environment is active.

You can now manage saved addresses on the **Contacts** page. Stored contacts
let you quickly fill the send form in the wallet view and are persisted in the
browser's local storage. Contacts can be edited or removed at any time using the
actions in the table.

Contacts can also be imported from or exported to a JSON file using the
**Import** and **Export** buttons. This makes it easy to back up your saved
addresses or move them between computers.

The wallet page can now fetch and display your account history from the
configured RPC endpoint. Click **Refresh** in the history section to load the
latest 20 transactions from the network.

The send form has been updated to create and broadcast real transactions via the
configured RPC node. A valid wallet seed and sufficient balance are required;
any errors from the node are shown next to the form.

The settings page also lets you configure the RPC endpoint used for network
requests. By default the application targets `https://rpc.nyano.org` but you
can update the URL to point to any compatible node.

You can also export your wallet seed to a text file or import it from one using
the new **Export** and **Import** buttons in the Wallet Seed section. This makes
backing up and restoring your wallet straightforward.

The wallet seed can now be protected with a password. Use the **Set Password**
button to encrypt the seed with your chosen passphrase. When a password is set
the seed field is locked until you click **Unlock** and provide the correct
password. Encrypted seeds are persisted in local storage so your wallet remains
secured across sessions.

The Settings page now also includes **Export Settings** and **Import Settings**
options. These let you back up or restore all application data including your
seed, contacts, history and preferences. A **Reset** button is available to
clear all saved data if needed.

Window size and position are now remembered across sessions. The app creates a
small `window-state.json` file under Electron's userData directory and restores
the previous bounds on startup. An application menu with **File** and **Help**
items has also been added. Selecting **About** from the Help menu shows a simple
dialog displaying the application version.

Account addresses and history entries include quick links to the NyanoScan
block explorer. Click the external link icon next to your address or any hash in
the history table to view details in your default browser.

## Install dependencies

```
cd linux-desktop
npm install
```

## Run the app

```
npm start
```

## Build a package

```bash
npm run build
```

This is a starting point. Future work can integrate wallet functionality, mining controls, and additional features inspired by platforms like Kraken. The interface uses Font Awesome icons bundled via `npm`.
