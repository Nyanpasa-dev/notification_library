import { DelayedQueueData, EmmediatelyData, RedisConnection, TelegramParams, WebSocketConnection } from '../types';
import { DelayedNotificationManager } from './delayedNotificationManager.js';
import { ImmediateNotificationManager } from './immediateNotificationManager.js';
import { TelegramNotificationManager } from './telegramNotificationManager.js';
interface BaseNotificationManager {
    closeResources(): Promise<void>;
}
interface QueueInitialized extends BaseNotificationManager {
    sendDelayedNotification(data: DelayedQueueData): Promise<void>;
    sendBulkDelayedNotification(data: DelayedQueueData[], delay: number): Promise<void>;
}
interface WsInitialized extends BaseNotificationManager {
    sendImmediateNotification(data: EmmediatelyData): Promise<void>;
    sendBulkImmediateNotification(data: EmmediatelyData[]): Promise<void>;
}
interface TelegramInitialized extends BaseNotificationManager {
    sendTelegramNotification(data: TelegramParams): Promise<void>;
}
type NotificationManager = BaseNotificationManager & Partial<QueueInitialized> & Partial<WsInitialized> & Partial<TelegramInitialized>;
declare class NotificationManagerImpl implements NotificationManager {
    private delayedNotificationManager?;
    private immediateNotificationManager?;
    private telegramNotificationManager?;
    private queueInitialized;
    private wsInitialized;
    private telegramInitialized;
    constructor(delayedNotificationManager?: DelayedNotificationManager, immediateNotificationManager?: ImmediateNotificationManager, telegramNotificationManager?: TelegramNotificationManager);
    static create(): NotificationManagerImpl;
    initQueue(redisConnection?: RedisConnection, queueName?: string): QueueInitialized;
    initWsConnection(wsConnection?: WebSocketConnection): WsInitialized;
    initTelegramConnection(telegramToken: string): TelegramInitialized;
    closeResources(): Promise<void>;
    private ensureQueueInitialized;
    private ensureWsInitialized;
    private ensureTelegramInitialized;
    sendImmediateNotification(data: EmmediatelyData): Promise<void>;
    sendBulkImmediateNotification(data: EmmediatelyData[]): Promise<void>;
    sendDelayedNotification(data: DelayedQueueData): Promise<void>;
    sendBulkDelayedNotification(data: DelayedQueueData[], delay: number): Promise<void>;
    sendTelegramNotification(data: TelegramParams): Promise<void>;
}
export { NotificationManagerImpl as NotificationManager };
