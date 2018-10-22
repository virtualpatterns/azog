#!/bin/bash

SCRIPT_FULL_PATH="$0"
SCRIPT_HOME_PATH="${SCRIPT_FULL_PATH%/*}"

SCRIPT_LOG_PATH="$HOME/Library/Logs/azog"
SCRIPT_ERR="$SCRIPT_LOG_PATH/azog.err"
SCRIPT_OUT="$SCRIPT_LOG_PATH/azog.out"

mkdir \
  -p \
  "$SCRIPT_LOG_PATH"

/usr/local/bin/node $SCRIPT_HOME_PATH/../index.js \
  completed "$1" "$2" \
  1>> "$SCRIPT_OUT" \
  2>> "$SCRIPT_ERR"
