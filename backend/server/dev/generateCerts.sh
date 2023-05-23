#!/bin/bash

mkdir -p certs

# Generate server certs (provided to Postgres instance)
openssl req -new -x509 -days 365 -nodes -text -out certs/server.crt -keyout certs/server.key -subj "/CN=db"
chmod og-rwx certs/server.key

# Generate client certs (provided to client applications)
openssl req -new -x509 -days 365 -nodes -text -out certs/client.crt -keyout certs/client.key -subj "/CN=client"
chmod og-rwx certs/client.key