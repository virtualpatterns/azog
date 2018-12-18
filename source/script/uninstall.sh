#!/bin/bash

/usr/local/bin/node "$HOME/Deluge/node_modules/azog/distributable/index.js" \
  uninstall \
  --configurationPath "$HOME/Deluge/configuration.json" \
  --logLevel debug --logPath console
