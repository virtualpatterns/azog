#!/bin/bash

SCRIPT_FULL_PATH="$0"
SCRIPT_HOME_PATH="${SCRIPT_FULL_PATH%/*}"

SCRIPT_LOG_PATH="$HOME/Deluge/Log"
SCRIPT_ERR="$SCRIPT_LOG_PATH/on-completed.err"
SCRIPT_OUT="$SCRIPT_LOG_PATH/on-completed.out"

mkdir \
  -p \
  "$SCRIPT_LOG_PATH"

/usr/local/bin/node $SCRIPT_HOME_PATH/../index.js \
  --configurationPath "$HOME/Deluge/configuration.json" \
  completed "$1" "$2" \
  1>> "$SCRIPT_OUT" \
  2>> "$SCRIPT_ERR"
