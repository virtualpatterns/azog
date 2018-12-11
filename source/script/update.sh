#!/bin/bash

SCRIPT_FULL_PATH="$0"
SCRIPT_HOME_PATH="${SCRIPT_FULL_PATH%/*}"

SERVER_NAME="$($SCRIPT_HOME_PATH/select.sh)"

sudo systemctl \
  stop deluged

sudo systemctl \
  stop openvpn

sudo cp \
  -v \
  /etc/openvpn/ovpn_tcp/$SERVER_NAME.tcp.ovpn  \
  /etc/openvpn/NordVPN.tcp.conf

sudo cp \
  -v \
  /etc/openvpn/ovpn_udp/$SERVER_NAME.udp.ovpn \
  /etc/openvpn/NordVPN.udp.conf

sudo find \
  /etc/openvpn/NordVPN.*.conf -print0 | \
  sudo xargs -0 -I {} -P 1 sed -i -e 's/auth-user-pass.*/auth-user-pass NordVPN/g' {}

sudo systemctl \
  start openvpn

sudo systemctl \
  status openvpn
  
echo sudo systemctl \
  start deluged
