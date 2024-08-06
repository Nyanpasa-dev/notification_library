import { TelegramParams } from "../types/index.js";
export interface TelegramManager {
    sendTelegramNotification(params: TelegramParams): Promise<void>;
    closeResources(): Promise<void>;
}
export declare class TelegramNotificationManager implements TelegramManager {
    private bot?;
    initTelegramConnection(telegramToken: string): this;
    sendTelegramNotification({ receivers, message, }: TelegramParams): Promise<void>;
    closeResources(): Promise<void>;
}
