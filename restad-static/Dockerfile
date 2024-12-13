# Этап сборки
FROM golang:1.23.2-alpine AS builder
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

# Создаем пользователя для безопасного запуска приложения

# Копируем собранное приложение из этапа сборки
COPY --from=builder /main /bin/main

# Меняем владельца бинарного файла на созданного пользователя

# Запускаем приложение от имени непользователя root

ENTRYPOINT ["/bin/main"]