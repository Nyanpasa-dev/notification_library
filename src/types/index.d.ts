import { WebSocket } from 'ws'

/**
 * Параметры для отправки уведомлений немедленно.
 */
export interface EmmediatelyData {
    type: string
    item: any
    message: string
    receivers?: number[] | null
    email?: EmailParams
    telegram?: TelegramParams
}

/**
 * Параметры для отправки уведомлений с задержкой.
 */
export interface DelayedQueueData extends EmmediatelyData {
    delay?: number | null
}

/**
 * Данные сообщения.
 */
export interface MessageData {
    key: string
    data: any
    message: string
}

/**
 * Параметры для отправки сообщения.
 */
export interface SendMessageParams {
    key: string
    data: any
    receivers?: number[] | null
    message?: string
}

/**
 * Параметры для отправки уведомлений в Telegram.
 */
export interface TelegramParams<T = string> {
    /**
     * Токен для доступа к Telegram API.
     */
    token: string

    /**
     * Список получателей уведомления.
     */
    receivers: T[]

    /**
     * Сообщение, которое будет отправлено. Обязательно должно быть в формате MarkdownV2.
     */
    message: string
}

/**
 * Параметры для отправки уведомлений по электронной почте.
 */
export interface EmailParams {
    /**
     * Список получателей уведомления.
     */
    receivers: string[]

    /**
     * Сообщение, которое будет отправлено. Обязательно должно быть в формате HTML.
     */
    message: string
}

/**
 * Интерфейс для взаимодействия с шлюзом уведомлений.
 */
export interface Gateway {
    /**
     * Отправляет уведомление.
     * @param params Параметры для отправки уведомления.
     */
    send(params: SendMessageParams): void

    /**
     * Закрывает WebSocket сервер.
     */
    close(): void
}

/**
 * Интерфейс клиента для взаимодействия с WebSocket.
 */
export interface Client<T = string> extends WebSocket {
    /**
     * Идентификатор пользователя.
     */
    userId: string

    /**
     * Токен Telegram.
     */
    telegram: T | null

    /**
     * Адрес электронной почты.
     */
    email: string | null

    /**
     * Флаг, указывающий, активен ли клиент.
     */
    isAlive: boolean
}

/**
 * Интерфейс для подключения к Redis.
 */
export interface RedisConnection {
    /**
     * Хост Redis.
     */
    host: string

    /**
     * Порт Redis.
     */
    port: number
}

export interface WebSocketConnection {
    port: number

    isProduction: boolean
}

/**
 * Опции менеджера уведомлений.
 */
export interface NotificationManagerOptions {
    /**
     * Подключение к Redis.
     */
    redisConnection?: RedisConnection

    /**
     * Подключение к WebSocket.
     */

    wsConnection?: WebSocketConnection

    /**
     * Имя очереди.
     */
    queueName?: string

    /**
     * Метод отправки уведомлений.
     */
    sendingMethod?: 'ws' | 'push'
}
