# Builder stage using Go 1.22
FROM golang:1.22 AS builder
WORKDIR /app

# Copy go.mod and download dependencies
COPY go.mod ./
RUN go mod download

# Copy the rest of the code and build the binary statically
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

# Final stage using Alpine
FROM alpine:latest
WORKDIR /app

# Install PostgreSQL client for running migrations
RUN apk add --no-cache postgresql-client

# Copy the built binary and the migration scripts
COPY --from=builder /app/app .
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/run_migrations.sh .

# Make sure the migration script is executable
RUN chmod +x run_migrations.sh

EXPOSE 8080
ENTRYPOINT ["./run_migrations.sh"]
