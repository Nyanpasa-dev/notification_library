import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { DelayedQueueData, Gateway, RedisConnection } from '../types/index.js';
import { WebSocketSingleton } from './webSocketSingleton.js';

export interface QueueManager {
    broadcastDelayedNotification(data: DelayedQueueData): Promise<void>;
    bulkBroadcastDelayedNotification(data: DelayedQueueData[], delay: number): Promise<void>;
    closeResources(): Promise<void>;
}

export class DelayedNotificationManager implements QueueManager {
  private queue?: Queue;
  private worker?: Worker;
  private queueEvents?: QueueEvents;
  private gateway?: Gateway;

  public initBullQueue(
      { host = 'localhost', port = 6379 }: RedisConnection = {},
      queueName: string = 'defaultQueueName'
  ): this {
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

      this.gateway = WebSocketSingleton.getInstance();
      return this;
  }

  private setupQueueEvents(): void {
      this.queueEvents?.on('completed', ({ jobId }) => {
          console.log(`Job ${jobId} completed`);
      });

      this.queueEvents?.on('failed', ({ jobId, failedReason }) => {
          console.error(`Job ${jobId} failed: ${failedReason}`);
      });
  }

  public async broadcastDelayedNotification(data: DelayedQueueData): Promise<void> {
      if ((data.delay ?? -1) < 0) {
          throw new Error('Delay is invalid.');
      }
      await this.addNotificationToQueue(data);
  }

  public async bulkBroadcastDelayedNotification(
      data: DelayedQueueData[],
      delay: number
  ): Promise<void> {
      if (data.length === 0) {
          throw new Error('Data is empty.');
      }

      for (const item of data) {
          await this.addNotificationToQueue({ ...item, delay });
      }
  }

  private async addNotificationToQueue(data: DelayedQueueData): Promise<void> {
      const { delay, customJobId, ...notificationData } = data;
      await this.queue?.add('notification', notificationData, { jobId: customJobId ?? uuidv4(), delay } as JobsOptions);
  }

  private async processJob(job: any): Promise<void> {
      const { type, item, sender, details, message, receivers, telegram, email } = job.data;
      const receiverIds = receivers ? receivers.map(String) : [];

      this.gateway?.send({
            key: type,
            data: item,
            receivers: receiverIds,
            message,
        });
  }

  public async closeResources(): Promise<void> {
      await this.queue?.close();
      await this.worker?.close();
      await this.queueEvents?.close();
  }
}