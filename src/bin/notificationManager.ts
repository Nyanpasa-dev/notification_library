import { DelayedQueueData, EmmediatelyData, RedisConnection, TelegramParams, WebSocketConnection } from '../types';
import { DelayedNotificationManager } from './delayedNotificationManager';
import { ImmediateNotificationManager } from './immediateNotificationManager';
import { TelegramNotificationManager } from './telegramNotificationManager';

interface BaseNotificationManager {
    closeResources(): Promise<void>;
}

interface QueueInitialized extends BaseNotificationManager {
    sendDelayedNotification(data: any): Promise<void>;
}

interface WsInitialized extends BaseNotificationManager {
    sendImmediateNotification(data: any): Promise<void>;
}

interface TelegramInitialized extends BaseNotificationManager {
    sendTelegramNotification(data: any): Promise<void>;
}

type NotificationManager = BaseNotificationManager &
    Partial<QueueInitialized> &
    Partial<WsInitialized> &
    Partial<TelegramInitialized>;

class NotificationManagerImpl implements NotificationManager {
    private delayedNotificationManager: DelayedNotificationManager;
    private immediateNotificationManager: ImmediateNotificationManager;
    private telegramNotificationManager: TelegramNotificationManager;

    constructor(
        delayedNotificationManager: DelayedNotificationManager,
        immediateNotificationManager: ImmediateNotificationManager,
        telegramNotificationManager: TelegramNotificationManager
    ) {
        this.delayedNotificationManager = delayedNotificationManager;
        this.immediateNotificationManager = immediateNotificationManager;
        this.telegramNotificationManager = telegramNotificationManager;
    }

    public static create(): NotificationManagerImpl {
        return new NotificationManagerImpl(
            new DelayedNotificationManager(),
            new ImmediateNotificationManager(),
            new TelegramNotificationManager()
        );
    }

    public initQueue(redisConnection?: RedisConnection, queueName?: string): QueueInitialized {
        this.delayedNotificationManager.initBullQueue(redisConnection, queueName);
        return this as QueueInitialized;
    }

    public initWsConnection(wsConnection?: WebSocketConnection): WsInitialized {
        this.immediateNotificationManager.initWsConnection(wsConnection);
        return this as WsInitialized;
    }

    public initTelegramConnection(telegramToken: string): TelegramInitialized {
        this.telegramNotificationManager.initTelegramConnection(telegramToken);
        return this as TelegramInitialized;
    }

    public async closeResources(): Promise<void> {
        await this.delayedNotificationManager.closeResources();
        await this.immediateNotificationManager.closeResources();
        await this.telegramNotificationManager.closeResources();
    }

    public async sendImmediateNotification(data: EmmediatelyData): Promise<void> {
        await this.immediateNotificationManager.broadcastEmmediatelyNotification(data);
    }

    public async sendDelayedNotification(data: DelayedQueueData): Promise<void> {
        await this.delayedNotificationManager.broadcastDelayedNotification(data);
    }

    public async sendTelegramNotification(data: TelegramParams): Promise<void> {
        await this.telegramNotificationManager.sendTelegramNotification(data);
    }
}

export { NotificationManagerImpl as NotificationManager };