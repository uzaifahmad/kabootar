FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o kabootar-server .

FROM gcr.io/distroless/static-debian11

COPY --from=builder /app/kabootar-server /
EXPOSE 3000

CMD ["/kabootar-server"]
