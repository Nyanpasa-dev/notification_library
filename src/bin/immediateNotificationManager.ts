import { EmmediatelyData, Gateway, SendMessageParams, WebSocketConnection } from '../types';
import { WebSocket } from './webSocket';

export interface ImmediateManager {
  broadcastEmmediatelyNotification(data: EmmediatelyData): Promise<void>;
  bulkBroadcastEmmediatelyNotification(data: EmmediatelyData[]): Promise<void>;
  closeResources(): Promise<void>;
}

export class ImmediateNotificationManager implements ImmediateManager {
  private gateway?: Gateway;

  public initWsConnection(params?: WebSocketConnection): this {
       this.gateway = new WebSocket(params);
       return this;
  }

  public async broadcastEmmediatelyNotification(data: EmmediatelyData): Promise<void> {
      if (data.receivers?.length === 0) {
          throw new Error('Receivers list is empty.');
      }

      await this.sendNotification(data);
  }

  public async bulkBroadcastEmmediatelyNotification(data: EmmediatelyData[]): Promise<void> {
      if (data.length === 0) {
          throw new Error('Data is empty.');
      }

      for (const item of data) {
          await this.sendNotification(item);
      }
  }

  private async sendNotification(data: EmmediatelyData): Promise<void> {
      this.gateway?.send({
          key: data.type,
          data: data.item,
          receivers: data.receivers,
          message: data.message,
      } as SendMessageParams);
  }

  public async closeResources(): Promise<void> {
      this.gateway?.close();
  }
}