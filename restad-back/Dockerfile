# Этап сборки
FROM golang:1.23.3-alpine AS builder
WORKDIR /build

# Копируем файлы зависимостей
COPY go.mod go.sum ./
RUN go mod download

# Копируем исходный код
COPY . .

# Сборка приложения
RUN go build -o /main ./cmd/api/

# Финальный минимальный образ
FROM alpine:3


# Копируем собранное приложение из этапа сборки
COPY --from=builder /main /bin/main


ENTRYPOINT ["/bin/main"]