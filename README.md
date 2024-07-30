# noty-nyan

noty-nyan is a TypeScript-based service for managing and sending notifications through various channels such as WebSocket, Telegram, and Email. It supports both immediate and delayed notifications.

## Table of Contents

- Installation
- Usage
- Configuration
- API
- Testing

## Installation

To install the dependencies, run:

```bash
npm install
```

## Usage

To start the Notification Manager, run:

```bash
npm start
```

## Configuration

The Notification Manager can be configured using environment variables:

- `SECRET_KEY`: The secret key used for JWT verification.
- `REDIS_HOST`: The Redis server host (default: `localhost`).
- `REDIS_PORT`: The Redis server port (default: `6379`).

## API

### Interfaces

#### EmmediatelyData

```typescript
interface EmmediatelyData {
  type: string;
  item: any;
  message: string;
  receivers?: number[] | null;
  email?: EmailParams;
  telegram?: TelegramParams;
}
```

#### DelayedQueueData

```typescript
interface DelayedQueueData extends EmmediatelyData {
  delay?: number | null;
}
```

#### SendMessageParams

```typescript
interface SendMessageParams {
  key: string;
  data: any;
  receivers?: number[] | null;
  message?: string;
}
```

#### TelegramParams

```typescript
interface TelegramParams<T = string> {
  token: string;
  receivers: T[];
  message: string;
}
```

#### EmailParams

```typescript
interface EmailParams {
  receivers: string[];
  message: string;
}
```

### Methods

#### `broadcastDelayedNotification(data: DelayedQueueData): Promise<this>`

Broadcasts a delayed notification.

#### `bulkBroadcastDelayedNotification(data: DelayedQueueData[], delay: number): Promise<this>`

Broadcasts multiple delayed notifications.

#### `broadcastEmmediatelyNotification(data: EmmediatelyData): Promise<this>`

Broadcasts an immediate notification.

#### `bulkBroadcastEmmediatelyNotification(data: EmmediatelyData[]): Promise<this>`

Broadcasts multiple immediate notifications.

#### `closeResources(): Promise<void>`

Closes all resources including WebSocket, Redis queue, and worker.

## Testing

To run the tests, use:

```bash
npm test
```


---

# noty-nyan[RU]

noty-nyan — это сервис на TypeScript для управления и отправки уведомлений через различные каналы, такие как WebSocket, Telegram и Email. Он поддерживает как немедленные, так и отложенные уведомления.

## Содержание

- Установка
- Использование
- Конфигурация
- API
- Тестирование

## Установка

Для установки зависимостей выполните:

```bash
npm install
```

## Использование

Для запуска Менеджера Уведомлений выполните:

```bash
npm start
```

## Конфигурация

Менеджер Уведомлений можно настроить с помощью переменных окружения:

- `SECRET_KEY`: Секретный ключ, используемый для проверки JWT.
- `REDIS_HOST`: Хост сервера Redis (по умолчанию: `localhost`).
- `REDIS_PORT`: Порт сервера Redis (по умолчанию: `6379`).

## API

### Интерфейсы

#### EmmediatelyData

```typescript
interface EmmediatelyData {
  type: string;
  item: any;
  message: string;
  receivers?: number[] | null;
  email?: EmailParams;
  telegram?: TelegramParams;
}
```

#### DelayedQueueData

```typescript
interface DelayedQueueData extends EmmediatelyData {
  delay?: number | null;
}
```

#### SendMessageParams

```typescript
interface SendMessageParams {
  key: string;
  data: any;
  receivers?: number[] | null;
  message?: string;
}
```

#### TelegramParams

```typescript
interface TelegramParams<T = string> {
  token: string;
  receivers: T[];
  message: string;
}
```

#### EmailParams

```typescript
interface EmailParams {
  receivers: string[];
  message: string;
}
```

### Методы

#### `broadcastDelayedNotification(data: DelayedQueueData): Promise<this>`

Отправляет отложенное уведомление.

#### `bulkBroadcastDelayedNotification(data: DelayedQueueData[], delay: number): Promise<this>`

Отправляет несколько отложенных уведомлений.

#### `broadcastEmmediatelyNotification(data: EmmediatelyData): Promise<this>`

Отправляет немедленное уведомление.

#### `bulkBroadcastEmmediatelyNotification(data: EmmediatelyData[]): Promise<this>`

Отправляет несколько немедленных уведомлений.

#### `closeResources(): Promise<void>`

Закрывает все ресурсы, включая WebSocket, очередь Redis и worker.

## Тестирование

Для запуска тестов используйте:

```bash
npm test
```
