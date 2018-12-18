#!/bin/bash

# /usr/local/bin/node "$HOME/Deluge/node_modules/azog/distributable/index.js" \
#   transfer \
#   --configurationPath "$HOME/Deluge/configuration.json"

/usr/local/bin/rsync \
  --exclude\=.DS_Store \
  --human-readable \
  --itemize-changes \
  --progress \
  --recursive \
  --remove-source-files \
  --rsh\=ssh \
  --verbose \
  --whole-file \
  "$HOME/Deluge/Processed/" \
  "BUCKBEAK.local:/Volumes/BUCKBEAK2/Media"
