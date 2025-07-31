This file includes a list of NYANO related projects.

If you are interested in including a link on nyano.org, please list it here first.

# List of Nyano projects
## Official sites
* https://nyano.org (official site)
* https://nyanoscan.org (official block explorer, https://github.com/jelofsson/nyanoscan)

## Wallets
* https://github.com/JeanOUINA/Nyault (Nyault)
* https://github.com/MajorChump/nyano-natrium-wallet (Nyano-Natrium)

## Faucets
* https://freenyanofaucet.com/ (Nyano faucet)

## Tipbots
* https://github.com/gurghet/NyanoTipBot (Twitter Tipbot)

## Communication
* https://discord.gg/VRGFGWjG (Discord)

## Games
* https://apps.apple.com/us/app/nyano-meow/id1593204477?l=nb (Nyano Meow)

## Other
* https://cdn.discordapp.com/attachments/903341738054258751/903987464471994418/nyano_brand_guidelines.pdf (Nyano Brand Guidelines)
* https://nyanomarketcap.com (Nyano Price & Marketcap Tracker)

# nyano.org
## dependencies
* font-awesome

## installation
npm install
## Desktop wallet
See [linux-desktop](linux-desktop/) for an Electron-based desktop wallet and miner.
The app now includes seed management, network selection on the settings page and a contacts view
where addresses can be added, edited or removed. Contacts support import and export
to a JSON file for easy backup.
You can also export or import the entire application settings from the Settings
page or reset all saved data. Transactions created in the wallet view are now
broadcast to the configured RPC endpoint, so the wallet is usable on the Nyano
network.
Transaction history entries in the wallet now show the resulting block hash with
links to NyanoScan for easy verification.
The wallet page now also shows the currently selected network so you can easily
confirm whether you are on mainnet, testnet or beta.
The desktop app now saves its window size and position so it reopens exactly
where you left it. A basic application menu provides Quit and About actions; the
About dialog shows the current version number.

```
cd linux-desktop
npm install
npm start
```

If a `nano_node` binary exists under `nano-node/build`, the desktop app
will automatically launch it in daemon mode when started.

## Running a local Nano node
You can build and run your own Nano node for use with the desktop wallet.
A helper script is provided under `scripts/setup-nano-node.sh`.
Run the following commands from the repository root:

```bash
./scripts/setup-nano-node.sh
```

This will clone the official node source from [djlacavera21/nano-node](https://github.com/djlacavera21/nano-node.git),
initialise submodules and compile the `nano_node` binary in `nano-node/build`.
Start the node with either of the following commands:

```bash
./nano-node/build/nano_node --daemon
```

or simply run the convenience script:

```bash
./scripts/run-nano-node.sh
```

Set the RPC endpoint in the desktop wallet settings to `http://localhost:7076` to
interact with your local node.
