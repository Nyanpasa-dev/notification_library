import { DelayedQueueData, EmailParams, EmmediatelyData, NotificationManagerOptions, RedisConnection, TelegramParams } from '../types';
import { Telegraf } from 'telegraf';
import { Gateway, SendMessageParams } from '../types';
import { ImmediatelyBroadcastingGateway } from './webSocket';
import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';

class NotificationManager {
  private gateway: Gateway;
  private queue: Queue;
  private worker: Worker;
  private queueEvents: QueueEvents;

  constructor({ redisConnection = { host: 'localhost', port: 6379 }, queueName = "defaultQueue", sendingMethod = 'ws' }: NotificationManagerOptions) {
    this.gateway = new ImmediatelyBroadcastingGateway();
    this.queue = new Queue(queueName, { connection: redisConnection });
    this.worker = new Worker(queueName, async job => {
      await this.processJob(job);
    }, { connection: redisConnection });
    this.queueEvents = new QueueEvents(queueName);
    

    this.setupQueueEvents();
  }

  private setupQueueEvents(): void {
    this.queueEvents.on('completed', ({ jobId }) => {
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
    });
  }

  private async sendNotification(data: EmmediatelyData): Promise<void> {
    this.gateway.send({ key: data.type, data: data.item, receivers: data.receivers, message: data.message } as SendMessageParams);

    if (data.telegram) {
      await this.sendTelegramNotification(data.telegram);
    }

    if (data.email) {
      await this.sendEmailNotification(data.email);
    }
  }

  public async broadcastDelayedNotification(data: DelayedQueueData): Promise<this> {
    if ((data.delay ?? -1) < 0) {
      throw new Error("Delay is invalid.");
    }
    await this.addNotificationToQueue(data);
    return this;
  }

  public async bulkBroadcastDelayedNotification(data: DelayedQueueData[], delay: number): Promise<this> {
    if (data.length === 0) {
      throw new Error("Data is empty.");
    }

    for (const item of data) {
      await this.addNotificationToQueue({ ...item, delay });
    }

    return this;
  }

  public async broadcastEmmediatelyNotification(data: EmmediatelyData): Promise<this> {
    if (data.receivers?.length === 0) {
      throw new Error("Receivers list is empty.");
    }

    await this.sendNotification(data);

    return this;
  }

  public async bulkBroadcastEmmediatelyNotification(data: EmmediatelyData[]): Promise<this> {
    if (data.length === 0) {
      throw new Error("Data is empty.");
    }

    for (const item of data) {
      await this.sendNotification(item);
    }

    return this;
  }

  private async addNotificationToQueue(data: DelayedQueueData): Promise<void> {
    const { delay, ...notificationData } = data;
    const options: JobsOptions = delay ? { delay } : {};
    await this.queue.add('notification', notificationData, options);
  }

  private async processJob(job: any): Promise<void> {
    const { type, item, sender, details, message, receivers, telegram, email } = job.data;
    const data = { type, item, sender, details, message };
    const receiverIds = receivers ? receivers.map(String) : [];

    this.gateway.send({ key: type, data, receivers: receiverIds, message });

    if (telegram) {
      await this.sendTelegramNotification(telegram);
    }

    if (email) {
      await this.sendEmailNotification(email);
    }
  }

  private async sendTelegramNotification({ token, receivers, message }: TelegramParams): Promise<void> {
    const bot = new Telegraf(token);
    await bot.launch();

    for (const receiver of receivers) {
      await bot.telegram.sendMessage(receiver, message, { parse_mode: 'MarkdownV2' });
    }
  }

  private async sendEmailNotification({ receivers, message }: EmailParams): Promise<void> {
    // Implement email sending logic here
  }

  public async closeResources() {
    this.gateway.close();
    await this.queue.close();
    await this.worker.close();
    await this.queueEvents.close();
  }
}

export { NotificationManager };