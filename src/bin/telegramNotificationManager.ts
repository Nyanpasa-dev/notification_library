import { Telegraf } from "telegraf";
import { TelegramParams } from "../types";

export interface TelegramManager {
  sendTelegramNotification(params: TelegramParams): Promise<void>;
  closeResources(): Promise<void>;
}

export class TelegramNotificationManager implements TelegramManager {
  private bot?: Telegraf;

  public initTelegramConnection(telegramToken: string): this {
      this.bot = new Telegraf(telegramToken);
      this.bot.launch();
      return this;
  }

  public async sendTelegramNotification({
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

  public async closeResources(): Promise<void> {
    return
  }
}