#!/bin/bash
set -e

REPO="https://github.com/djlacavera21/nano-node.git"
DIR="nano-node"

if [ ! -d "$DIR" ]; then
  git clone "$REPO" "$DIR"
fi

cd "$DIR"

git submodule update --init --recursive

mkdir -p build
cd build

cmake .. -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)

echo "Nano node built in $(pwd)." 
