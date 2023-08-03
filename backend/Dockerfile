FROM golang:1.20-buster as builder

# Create and change to the app directory.
WORKDIR /app

# Copy only go.mod and go.sum to fetch dependencies so they can be cached.
COPY go.* .
RUN go mod download

# Copy remaining local code to the container image.
COPY . .

# Build the binary.
RUN go build -mod=readonly -v -o runserver cmd/main.go

# Use the official Debian slim image for a lean production container.
# https://hub.docker.com/_/debian
# https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
FROM debian:buster-slim
RUN set -x && apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
  ca-certificates && \
  rm -rf /var/lib/apt/lists/*

# Copy the binary to the production image from the builder stage.
COPY --from=builder /app/runserver /app/runserver

# Run the web service on container startup.
CMD ["/app/runserver"]
