# Nyano Desktop

This directory contains a small Electron application that acts as the starting
point for a Nyano desktop wallet and miner. The interface now uses a left side
navigation bar with separate pages for **Wallet**, **Miner**, and
**Settings**. The platform information is exposed via a preload API and shown on
the settings page.

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
