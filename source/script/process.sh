#!/bin/bash

/usr/local/bin/node "$HOME/Deluge/node_modules/azog/distributable/index.js" \
  process \
  "0" "$1" "$HOME/Deluge/Downloaded" \
  --configurationPath "$HOME/Deluge/configuration.json" \
  --logLevel trace --logPath console
