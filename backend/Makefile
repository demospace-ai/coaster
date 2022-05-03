build:
	go build -o bin/server cmd/main.go

migrate:
	migrate -path migrations/ -database "postgres://fabra:fabra@localhost:5432/fabra?sslmode=disable" up
