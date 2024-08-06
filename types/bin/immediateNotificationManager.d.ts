import { EmmediatelyData, WebSocketConnection } from '../types';
export interface ImmediateManager {
    broadcastEmmediatelyNotification(data: EmmediatelyData): Promise<void>;
    bulkBroadcastEmmediatelyNotification(data: EmmediatelyData[]): Promise<void>;
    closeResources(): Promise<void>;
}
export declare class ImmediateNotificationManager implements ImmediateManager {
    private gateway?;
    initWsConnection(params?: WebSocketConnection): this;
    broadcastEmmediatelyNotification(data: EmmediatelyData): Promise<void>;
    bulkBroadcastEmmediatelyNotification(data: EmmediatelyData[]): Promise<void>;
    private sendNotification;
    closeResources(): Promise<void>;
}
