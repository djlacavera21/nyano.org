This file includes a list of NYANO related projects.

If you are interested in including a link on nyano.org, please list it here first.

# List of Nyano projects

## Official sites

- https://nyano.org (official site)
- https://nyanoscan.org (official block explorer, https://github.com/jelofsson/nyanoscan)

## Wallets

- https://github.com/JeanOUINA/Nyault (Nyault)
- https://github.com/MajorChump/nyano-natrium-wallet (Nyano-Natrium)

## Faucets

- https://freenyanofaucet.com/ (Nyano faucet)

## Tipbots

- https://github.com/gurghet/NyanoTipBot (Twitter Tipbot)

## Communication

- https://discord.gg/VRGFGWjG (Discord)

## Games

- https://apps.apple.com/us/app/nyano-meow/id1593204477?l=nb (Nyano Meow)

## Other

- https://cdn.discordapp.com/attachments/903341738054258751/903987464471994418/nyano_brand_guidelines.pdf (Nyano Brand Guidelines)
- https://nyanomarketcap.com (Nyano Price & Marketcap Tracker)

# nyano.org

## dependencies

- font-awesome

## installation

npm install

## Offline access

The site registers a small service worker (`sw.js`) to cache static assets so
that pages remain available when offline. Load the homepage once and it will
work without a network connection. When offline, requests will show a lightweight offline page if the resource is unavailable. The service worker can be removed via your
browser settings if needed.

An "offline" banner is displayed when the browser loses connectivity. It
automatically hides again once the connection is restored.

The homepage also caches the latest Nano price and network status in
`localStorage`. When the APIs are unreachable, the last known values are shown
with a `(cached)` label so the page still displays useful information even
without connectivity.

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

To generate packages for major platforms run:

```bash
npm run build-all
```

If a `nano_node` binary exists under `nano-node/build`, the desktop app
will automatically launch it in daemon mode when started. You can also
start or stop the embedded node from the **Settings** page using the new
controls.

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

## Updating the local node

If the `nano-node` source was built previously, you can update to the latest
version and rebuild the binary using the helper script:

```bash
./scripts/update-nano-node.sh
```

The script fetches the newest changes from the `nano-node` repository and
recompiles the daemon in `nano-node/build`.

## Continuous Integration

A GitHub Actions workflow automatically runs ESLint on every push and pull
request. This helps catch coding issues before changes are merged.

## Generating a wallet

You can generate a new Nano wallet from the command line using:

```bash
npm run generate-wallet
```

The command prints the seed, mnemonic and address (or secret/public key and address when using `--secret`) to the console. Provide a file path to save the wallet as JSON:

```bash
npm run generate-wallet -- wallet.json
```

You can also specify options:

```
npm run generate-wallet -- --index 2 --prefix nyano_ --count 3
npm run generate-wallet -- --seed <hex_seed> --count 2
npm run generate-wallet -- --mnemonic "word list..."
npm run generate-wallet -- --mnemonic "word list..." --passphrase myphrase
npm run generate-wallet -- --keys
npm run generate-wallet -- --password mypass -- wallet.json
npm run generate-wallet -- --secret <secret_key>
```

When providing a `--password`, the wallet seed is encrypted before being saved
to disk or printed to the console.

Run the wallet API server with:

```
npm run wallet-api
```

The server enables CORS and sets common security headers so it can be safely
accessed from browser-based clients. Unknown routes now return a `404` response
and unexpected errors are handled gracefully.

It exposes several endpoints:

- `GET /generate` – returns a new wallet. Optional query parameters `index`,
  `prefix` and `count` allow specifying the account index, address prefix and
  number of addresses to generate.
- `POST /derive` – derive from a provided seed, mnemonic or secret key. Send `index`,
  `prefix`, `passphrase` and `count` in the JSON body to control the derived addresses.
- `POST /keys` – return the secret and public keys for a seed, mnemonic or secret key.
  Include `passphrase` if the mnemonic uses one.
- `POST /encrypt` – encrypt a seed or secret key with a password. Send `seed` or
  `secretKey` plus `password` in the JSON body.
- `POST /decrypt` – decrypt an encrypted seed or secret key using a password. Send
  `encryptedSeed` and `password` in the JSON body.
- `POST /validate` – validate a seed, mnemonic, address or secret key.
