To create a new migration file run
migrate create -ext sql -dir migrations -seq <name of your migration>

To connect to prod DB (password in secret manager):
gcloud sql connect fabra-database-instance -d=fabra-db -u=db_user --quiet
