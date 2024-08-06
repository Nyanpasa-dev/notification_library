import { DelayedQueueData, RedisConnection } from '../types/index.js';
export interface QueueManager {
    broadcastDelayedNotification(data: DelayedQueueData): Promise<void>;
    bulkBroadcastDelayedNotification(data: DelayedQueueData[], delay: number): Promise<void>;
    closeResources(): Promise<void>;
}
export declare class DelayedNotificationManager implements QueueManager {
    private queue?;
    private worker?;
    private queueEvents?;
    private gateway?;
    initBullQueue({ host, port }?: RedisConnection, queueName?: string): this;
    private setupQueueEvents;
    broadcastDelayedNotification(data: DelayedQueueData): Promise<void>;
    bulkBroadcastDelayedNotification(data: DelayedQueueData[], delay: number): Promise<void>;
    private addNotificationToQueue;
    private processJob;
    closeResources(): Promise<void>;
}
