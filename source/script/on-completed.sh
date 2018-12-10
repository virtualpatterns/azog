#!/bin/bash

SCRIPT_FULL_PATH="$0"
SCRIPT_LOG_PATH="$HOME/Deluge/Log"

/usr/bin/tsp /usr/local/bin/node "$HOME/Deluge/node_modules/azog/distributable/index.js" \
  --configurationPath "$HOME/Deluge/configuration.json" \
  "$1" "$2" "$3"
