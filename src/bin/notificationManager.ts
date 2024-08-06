import { RedisConnection, WebSocketConnection } from '../types';
import {
    DelayedQueueData,
    EmailParams,
    EmmediatelyData,
    TelegramParams,
} from '../types';
import { Telegraf } from 'telegraf';
import { Gateway, SendMessageParams } from '../types';
import { ImmediatelyBroadcastingGateway } from './webSocket';
import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';

interface InitializedNotificationManager {
    broadcastDelayedNotification(data: DelayedQueueData): Promise<this>;
    bulkBroadcastDelayedNotification(data: DelayedQueueData[], delay: number): Promise<this>;
    broadcastEmmediatelyNotification(data: EmmediatelyData): Promise<this>;
    bulkBroadcastEmmediatelyNotification(data: EmmediatelyData[]): Promise<this>;
    closeResources(): Promise<void>;
}

class NotificationManager {
    private gateway?: Gateway;
    private queue?: Queue;
    private worker?: Worker;
    private queueEvents?: QueueEvents;
    private bot?: Telegraf;

    constructor() {}

    public static create(): NotificationManager {
        return new NotificationManager();
    }

    public initQueue(
        { host = 'localhost', port = 6379 }: RedisConnection = {},
        queueName: string = 'defaultQueueName'
    ): InitializedNotificationManager {
        this.queue = new Queue(queueName, { connection: { host, port } });

        this.worker = new Worker(
            queueName,
            async (job) => {
                await this.processJob(job);
            },
            { connection: { host, port } }
        );

        this.queueEvents = new QueueEvents(queueName);
        this.setupQueueEvents();

        return this as InitializedNotificationManager;
    }

    public initWsConnection(wsConnection: WebSocketConnection): InitializedNotificationManager {
        this.gateway = new ImmediatelyBroadcastingGateway(wsConnection);
        return this as InitializedNotificationManager;
    }

    public initTelegramConnection(telegramToken: string): InitializedNotificationManager {
        this.bot = new Telegraf(telegramToken);
        this.bot.launch();
        return this as InitializedNotificationManager;
    }

    public initEmailConnection(emailConnection: any): InitializedNotificationManager {
        // Implement email connection initialization logic here
        return this as InitializedNotificationManager;
    }

    private setupQueueEvents(): void {
        this.queueEvents?.on('completed', ({ jobId }) => {
            console.log(`Job ${jobId} completed`);
        });

        this.queueEvents?.on('failed', ({ jobId, failedReason }) => {
            console.error(`Job ${jobId} failed: ${failedReason}`);
        });
    }

    private async sendNotification(data: EmmediatelyData): Promise<void> {
        this.gateway?.send({
            key: data.type,
            data: data.item,
            receivers: data.receivers,
            message: data.message,
        } as SendMessageParams);

        if (data.telegram) {
            await this.sendTelegramNotification(data.telegram);
        }

        if (data.email) {
            await this.sendEmailNotification(data.email);
        }
    }

    public async broadcastDelayedNotification(data: DelayedQueueData): Promise<this> {
        if ((data.delay ?? -1) < 0) {
            throw new Error('Delay is invalid.');
        }
        await this.addNotificationToQueue(data);
        return this;
    }

    public async bulkBroadcastDelayedNotification(
        data: DelayedQueueData[],
        delay: number
    ): Promise<this> {
        if (data.length === 0) {
            throw new Error('Data is empty.');
        }

        for (const item of data) {
            await this.addNotificationToQueue({ ...item, delay });
        }

        return this;
    }

    public async broadcastEmmediatelyNotification(data: EmmediatelyData): Promise<this> {
        if (data.receivers?.length === 0) {
            throw new Error('Receivers list is empty.');
        }

        await this.sendNotification(data);
        return this;
    }

    public async bulkBroadcastEmmediatelyNotification(data: EmmediatelyData[]): Promise<this> {
        if (data.length === 0) {
            throw new Error('Data is empty.');
        }

        for (const item of data) {
            await this.sendNotification(item);
        }

        return this;
    }

    private async addNotificationToQueue(data: DelayedQueueData): Promise<void> {
        const { delay, customJobId, ...notificationData } = data;
        await this.queue?.add('notification', notificationData, {jobId: customJobId ?? uuidv4(), delay} as JobsOptions);
    }

    private async processJob(job: any): Promise<void> {
        const { type, item, sender, details, message, receivers, telegram, email } = job.data;
        const receiverIds = receivers ? receivers.map(String) : [];

        this.sendNotification({ type, item, message, receivers: receiverIds, telegram, email });
    }

    private async sendTelegramNotification({
        receivers,
        message,
    }: TelegramParams): Promise<void> {
        if (!this.bot) {
            console.log('Telegram bot is not initialized');
            return;
        }

        for (const receiver of receivers) {
            await this.bot.telegram.sendMessage(receiver, message, { parse_mode: 'MarkdownV2' });
        }
    }

    private async sendEmailNotification({ receivers, message }: EmailParams): Promise<void> {
        // Implement email sending logic here
    }

    public async closeResources(): Promise<void> {
        this.gateway?.close();
        await this.queue?.close();
        await this.worker?.close();
        await this.queueEvents?.close();
    }
}

export { NotificationManager };