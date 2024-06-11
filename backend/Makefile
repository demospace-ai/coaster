build:
	go build -o bin/server cmd/main.go

migrate:
	migrate -path migrations/ -database "postgres://coaster:coaster@localhost:5432/coaster?sslmode=disable" up

migrate-down:
	migrate -path migrations/ -database "postgres://coaster:coaster@localhost:5432/coaster?sslmode=disable" down 1
