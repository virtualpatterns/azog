#!/bin/bash

/usr/bin/tsp /usr/local/bin/node "$HOME/Deluge/node_modules/azog/distributable/index.js" \
  process \
  "$1" "$2" "$3" \
  --configurationPath "$HOME/Deluge/configuration.json"
