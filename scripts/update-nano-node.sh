#!/bin/bash
set -e

DIR="nano-node"
REPO="https://github.com/djlacavera21/nano-node.git"

if [ ! -d "$DIR" ]; then
  echo "Node source not found. Run scripts/setup-nano-node.sh first." >&2
  exit 1
fi

cd "$DIR"

git fetch origin
if [ -n "$(git status --porcelain)" ]; then
  echo "Local changes detected in $DIR. Please commit or stash them first." >&2
  exit 1
fi

git pull --ff-only origin master

cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)

echo "Nano node updated in $(pwd)."
