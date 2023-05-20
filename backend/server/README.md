To create a new migration file run
migrate create -ext sql -dir migrations -seq <name of your migration>

To connect to prod DB (password in secret manager):
gcloud sql connect fabra-database-instance -d=fabra-db -u=db_user --quiet

## Getting Started

1. [Install Go here](https://go.dev/doc/install)

2. [Install Docker](https://docs.docker.com/get-docker/)

3. Spin up the Dev Postgres Docker instance 

```
cd server/dev
docker compose up # Runs it in the terminal
docker compose up -d  # Detaches it so it runs in the background

docker compose logs fabra_db # fabra_db is the service name, use this to view logs of a detached service.
```

To spin down the container:

```
docker compose down # Stops container but doesn't delete DB
docker compose down -v # Deletes all volumes, i.e. the DB, so you can recreate it
```

4. Setup initial tables (run this again when adding migrations).

```
brew install golang-migrate
make migrate
```

5. Configure GCloud Secret Manager

You'll need to [install the gcloud CLI](https://cloud.google.com/sdk/docs/install).

You'll also need to be added to the Fabra Developer Google Cloud project. Ask Nick for help here.

Once you've been added, you can login via `gcloud auth application-default login`.

6. Build and run the server

```
make
./bin/server
```


## Appendix

### Notes
When setting up a new GCP project, you may need to run:
```
gcloud compute project-info add-metadata --metadata serial-port-logging-enable=true
```

### Adding migrations
From the `backend/server` directory, run
```
migrate create -ext sql -dir migrations -seq the-name-of-your-migration
```
