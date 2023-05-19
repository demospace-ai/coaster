#!/bin/bash
set -e

MKDIR /var/lib/postgresql/data/conf.d
PG_CONF="/var/lib/postgresql/data/postgresql.conf"

# Enable SSL
echo "include_dir = 'conf.d'" >> $PG_CONF
echo "ssl = on" >> $PG_CONF
echo "ssl_cert_file = '/etc/postgresql/data/server.crt'" >> $PG_CONF
echo "ssl_key_file = '/etc/postgresql/data/server.key'" >> $PG_CONF
