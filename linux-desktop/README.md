# Nyano Desktop

This directory contains a small Electron application that acts as the starting
point for a Nyano desktop wallet and miner. The interface uses a left side
navigation bar with separate pages for **Wallet**, **Miner**, and
**Settings**. The platform information and application version are exposed via a
preload API and shown on the settings page. The wallet view includes a simple
send form and address display, while the miner page provides start/stop controls.
A dark mode toggle is also available in the settings. Sent transactions are
tracked locally and shown in a simple history table within the wallet view.

## Install dependencies

```
cd linux-desktop
npm install
```

## Run the app

```
npm start
```

This is a starting point. Future work can integrate wallet functionality, mining controls, and additional features inspired by platforms like Kraken. The interface uses Font Awesome icons bundled via `npm`.
