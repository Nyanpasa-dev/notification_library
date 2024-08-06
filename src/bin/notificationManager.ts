import { DelayedQueueData, EmmediatelyData, RedisConnection, TelegramParams, WebSocketConnection } from '../types';
import { DelayedNotificationManager } from './delayedNotificationManager';
import { ImmediateNotificationManager } from './immediateNotificationManager';
import { TelegramNotificationManager } from './telegramNotificationManager';

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

type NotificationManager = BaseNotificationManager &
    Partial<QueueInitialized> &
    Partial<WsInitialized> &
    Partial<TelegramInitialized>;

class NotificationManagerImpl implements NotificationManager {
    protected delayedNotificationManager?: DelayedNotificationManager;
    protected immediateNotificationManager?: ImmediateNotificationManager;
    protected telegramNotificationManager?: TelegramNotificationManager;

    private queueInitialized: boolean = false;
    private wsInitialized: boolean = false;
    private telegramInitialized: boolean = false;

    constructor(
        delayedNotificationManager?: DelayedNotificationManager,
        immediateNotificationManager?: ImmediateNotificationManager,
        telegramNotificationManager?: TelegramNotificationManager
    ) {
        this.delayedNotificationManager = delayedNotificationManager;
        this.immediateNotificationManager = immediateNotificationManager;
        this.telegramNotificationManager = telegramNotificationManager;
    }

    public static create(): NotificationManagerImpl {
        return new NotificationManagerImpl();
    }

    public initQueue(redisConnection?: RedisConnection, queueName?: string): QueueInitialized {
        if (!this.delayedNotificationManager) {
            this.delayedNotificationManager = new DelayedNotificationManager();
        }
        this.delayedNotificationManager.initBullQueue(redisConnection, queueName);
        this.queueInitialized = true;
        return this as QueueInitialized;
    }

    public initWsConnection(wsConnection?: WebSocketConnection): WsInitialized {
        if (!this.immediateNotificationManager) {
            this.immediateNotificationManager = new ImmediateNotificationManager();
        }
        this.immediateNotificationManager.initWsConnection(wsConnection);
        this.wsInitialized = true;
        return this as WsInitialized;
    }

    public initTelegramConnection(telegramToken: string): TelegramInitialized {
        if (!this.telegramNotificationManager) {
            this.telegramNotificationManager = new TelegramNotificationManager();
        }
        this.telegramNotificationManager.initTelegramConnection(telegramToken);
        this.telegramInitialized = true;
        return this as TelegramInitialized;
    }

    public async closeResources(): Promise<void> {
        if (this.queueInitialized && this.delayedNotificationManager) {
            await this.delayedNotificationManager.closeResources();
        }
        if (this.wsInitialized && this.immediateNotificationManager) {
            await this.immediateNotificationManager.closeResources();
        }
        if (this.telegramInitialized && this.telegramNotificationManager) {
            await this.telegramNotificationManager.closeResources();
        }
    }

    private ensureQueueInitialized() {
        if (!this.queueInitialized) {
            throw new Error('Queue is not initialized.');
        }
    }

    private ensureWsInitialized() {
        if (!this.wsInitialized) {
            throw new Error('WebSocket connection is not initialized.');
        }
    }

    private ensureTelegramInitialized() {
        if (!this.telegramInitialized) {
            throw new Error('Telegram connection is not initialized.');
        }
    }

    public async sendImmediateNotification(data: EmmediatelyData): Promise<void> {
        this.ensureWsInitialized();
        await this.immediateNotificationManager!.broadcastEmmediatelyNotification(data);
    }

    public async sendBulkImmediateNotification(data: EmmediatelyData[]): Promise<void> {
        this.ensureWsInitialized();
        await this.immediateNotificationManager!.bulkBroadcastEmmediatelyNotification(data);
    }

    public async sendDelayedNotification(data: DelayedQueueData): Promise<void> {
        this.ensureQueueInitialized();
        await this.delayedNotificationManager!.broadcastDelayedNotification(data);
    }

    public async sendBulkDelayedNotification(data: DelayedQueueData[], delay: number): Promise<void> {
        this.ensureQueueInitialized();
        await this.delayedNotificationManager!.bulkBroadcastDelayedNotification(data, delay);
    }

    public async sendTelegramNotification(data: TelegramParams): Promise<void> {
        this.ensureTelegramInitialized();
        await this.telegramNotificationManager!.sendTelegramNotification(data);
    }
}

export { NotificationManagerImpl as NotificationManager };
