#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$SCRIPT_DIR/linux-desktop"
APP_NAME="NyanoDesktop"
ICON_SRC="$SCRIPT_DIR/android-chrome-72x72.png"

# ensure node
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Installing..."
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    echo "Please install Node.js manually."
    exit 1
  fi
fi

cd "$APP_DIR"
# install dependencies
npm install

# build nano node if missing
"$SCRIPT_DIR/scripts/setup-nano-node.sh"

# build packaged application
npm run build

# determine build directory
ARCH="x64"
if [ "$(uname -m)" = "aarch64" ]; then
  ARCH="arm64"
fi
BUILD_DIR="$APP_DIR/${APP_NAME}-linux-$ARCH"

if [ ! -d "$BUILD_DIR" ]; then
  echo "Could not find built directory $BUILD_DIR"
  exit 1
fi

# install to /opt
INSTALL_PATH="/opt/$APP_NAME"
sudo rm -rf "$INSTALL_PATH"
sudo mkdir -p "$INSTALL_PATH"
sudo cp -r "$BUILD_DIR"/* "$INSTALL_PATH"/

# copy icon
sudo cp "$ICON_SRC" "$INSTALL_PATH/nyano.png"

desktop_file="$HOME/.local/share/applications/nyano.desktop"
mkdir -p "$(dirname "$desktop_file")"
cat <<EOD > "$desktop_file"
[Desktop Entry]
Type=Application
Name=Nyano Desktop
Exec=$INSTALL_PATH/$APP_NAME
Icon=$INSTALL_PATH/nyano.png
Terminal=false
Categories=Finance;
EOD

chmod +x "$desktop_file"

echo "Nyano Desktop installed."
