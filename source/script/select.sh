#!/bin/bash

/usr/local/bin/http \
  "https://nordvpn.com/wp-admin/admin-ajax.php?action=servers_recommendations&filters={\"country_id\":38,\"servers_groups\":[15]}" \
  | jq \
      '.[0] | .hostname' \
      | sed \
          -e 's/^\"//' \
          -e 's/\"$//' \
          | sed \
              ':a;N;$!ba;s/\n/A/g'
