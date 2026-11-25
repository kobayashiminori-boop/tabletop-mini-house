#!/usr/bin/env bash
set -euo pipefail

source "$NVM_DIR/nvm.sh"
nvm install 24
node tools/check-layout.cjs
npm --prefix assignment-08 ci --ignore-scripts
npm --prefix assignment-08 run check
