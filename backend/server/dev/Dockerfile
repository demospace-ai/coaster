FROM postgres:latest

COPY server.crt /etc/postgresql/certs/
COPY server.key /etc/postgresql/certs/
COPY setup-ssl.sh /docker-entrypoint-initdb.d/

# RUN mkdir -p /var/lib/postgresql/data/conf.d

RUN chown postgres:postgres /etc/postgresql/certs/server.*
RUN chmod 600 /etc/postgresql/certs/server.key
RUN chmod +x /docker-entrypoint-initdb.d/setup-ssl.sh
