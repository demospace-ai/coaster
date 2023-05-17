To create a new migration file run
migrate create -ext sql -dir migrations -seq <name of your migration>

To connect to prod DB (password in secret manager):
gcloud sql connect fabra-database-instance -d=fabra-db -u=db_user --quiet

## Getting Started

1. [Install Go here](https://go.dev/doc/install)

2. Install PostgresQL:

```
brew install postgresql
```

3. [Install Docker](https://docs.docker.com/get-docker/)

4. Spin up a Postgres Docker container

```
docker pull postgres
docker run -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

5. Create the necessary users and permissions.

```
psql -h 0.0.0.0 -U postgres

CREATE DATABASE fabra;
CREATE USER fabra;
ALTER USER fabra WITH SUPERUSER;
ALTER USER fabra WITH PASSWORD 'fabra';
```

6. Configure GCloud Secret Manager

You'll need to [install the gcloud CLI](https://cloud.google.com/sdk/docs/install).

You'll also need to be added to the Fabra Developer Google Cloud project. Ask Nick for help here.

Once you've been added, you can login via `gcloud auth login`.

7. Build and run the server

```
make migrate
make
./bin/server
```


Notes:
When setting up a new GCP project, you may need to run
```
gcloud compute project-info add-metadata --metadata serial-port-logging-enable=true
```
