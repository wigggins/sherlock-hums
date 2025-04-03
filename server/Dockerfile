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
COPY --from=builder /app/app .

EXPOSE 8080
ENTRYPOINT ["./app"]
