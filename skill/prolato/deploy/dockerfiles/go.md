# Go Dockerfile

Dockerfile template for Go projects (Gin, Echo, Fiber, Chi, net/http).

## Dockerfile

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

FROM alpine:3.19
WORKDIR /app
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
```

## Notes

- The build produces a static binary with `CGO_ENABLED=0`, making the final image minimal (alpine without Go runtime).
- If the main package is not in the root directory, adjust the build command: `go build -o server ./cmd/server` (or the appropriate path).
- Default port is `8080`. Adjust based on what the application listens on.
- If `go.sum` does not exist, remove it from the `COPY` line.
- Replace `1.22` with the Go version specified in `go.mod` (the `go` directive).
