import { EmailParams } from "../types";
export declare class EmailNotificationManager {
    initEmailConnection(emailConnection: any): void;
    sendEmailNotification({ receivers, message }: EmailParams): Promise<void>;
    closeResources(): Promise<void>;
}
