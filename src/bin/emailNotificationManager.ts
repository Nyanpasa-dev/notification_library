import { EmailParams } from "../types";

export class EmailNotificationManager {
  public initEmailConnection(emailConnection: any): void {
      // Implement email connection initialization logic here
  }

  public async sendEmailNotification({ receivers, message }: EmailParams): Promise<void> {
      // Implement email sending logic here
  }

  public async closeResources(): Promise<void> {
      // Implement logic to close Email resources if needed
  }
}