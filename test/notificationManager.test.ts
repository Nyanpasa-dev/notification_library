import { Queue } from 'bullmq';
import { Telegraf } from 'telegraf';
import { NotificationManager } from '../src/bin/notificationManager';
import { DelayedQueueData, EmmediatelyData, EmailParams, TelegramParams } from '../src/types';
import { v4 as uuidv4 } from 'uuid';

jest.mock('telegraf', () => {
    return {
        Telegraf: jest.fn().mockImplementation(() => {
            return {
                telegram: {
                    sendMessage: jest.fn(),
                },
                launch: jest.fn(),
            };
        }),
    };
});

describe('NotificationManager', () => {
    let QueueManager: any;
    let ImmediateManager: any;

    beforeAll(() => {
        QueueManager = NotificationManager.create().initQueue({ host: 'localhost', port: 6379 }, 'defaultQueueName');
        ImmediateManager = NotificationManager.create().initWsConnection({ port: 3000 });
    });

    afterAll(async () => {
        await QueueManager.closeResources();
        await ImmediateManager.closeResources();
    });

    it('should send delayed notification', async () => {
        const data: DelayedQueueData = {
            type: 'delayed',
            item: 'notification',
            message: 'Hello',
            delay: 10000,
            customJobId: uuidv4(),
        };

        await expect(
            QueueManager.sendDelayedNotification(data),
        ).resolves.toBeUndefined();
    });

    it('should send bulk immediate notifications', async () => {
        const data: EmmediatelyData[] = [
            {
                type: 'immediate',
                item: 'notification1',
                message: 'Hello 1',
                receivers: [1],
            },
            {
                type: 'immediate',
                item: 'notification2',
                message: 'Hello 2',
                receivers: [1],
            },
        ];

        await expect(
            ImmediateManager.sendBulkImmediateNotification(data),
        ).resolves.toBeUndefined();
    });

    it('should send bulk delayed notifications', async () => {
        const data: DelayedQueueData[] = [
            {
                type: 'delayed',
                item: 'notification1',
                message: 'Hello 1',
                delay: 5000,
                customJobId: uuidv4(),
            },
            {
                type: 'delayed',
                item: 'notification2',
                message: 'Hello 2',
                delay: 10000,
                customJobId: uuidv4(),
            },
        ];

        await expect(
            QueueManager.sendBulkDelayedNotification(data, 5000),
        ).resolves.toBeUndefined();
    });

    it('should throw an error if receivers list is empty for immediate notification', async () => {
        const data: EmmediatelyData = {
            type: 'immediate',
            item: 'notification',
            message: 'Hello',
            receivers: [],
        };

        await expect(ImmediateManager.sendImmediateNotification(data)).rejects.toThrow(
            'Receivers list is empty.',
        );
    });

    it('should throw an error if data is empty for bulk immediate notifications', async () => {
        const data: EmmediatelyData[] = [];

        await expect(
            ImmediateManager.sendBulkImmediateNotification(data),
        ).rejects.toThrow('Data is empty.');
    });

    it('should throw an error if delay is invalid for delayed notification', async () => {
        const data: DelayedQueueData = {
            type: 'delayed',
            item: 'notification',
            message: 'Hello',
            delay: -1000,
        };

        await expect(QueueManager.sendDelayedNotification(data)).rejects.toThrow(
            'Delay is invalid.',
        );
    });

    it('should throw an error if data is empty for bulk delayed notifications', async () => {
        const data: DelayedQueueData[] = [];

        await expect(
            QueueManager.sendBulkDelayedNotification(data, 5000),
        ).rejects.toThrow('Data is empty.');
    });
});


describe('Telegraf telegram.sendMessage', () => {
    let notificationManager: NotificationManager;
    let mockBot: any;

    beforeAll(() => {
        notificationManager = NotificationManager.create();
        notificationManager.initTelegramConnection('fakeToken');
    });

    beforeEach(() => {
        mockBot = {
            telegram: {
                sendMessage: jest.fn(),
            },
        };

        if(notificationManager['telegramNotificationManager']){
            notificationManager['telegramNotificationManager']['bot'] = mockBot; // Inject the mock bot
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await notificationManager.closeResources();
    });

    it('should log a message if the bot is not initialized', async () => {
        console.log = jest.fn();
        if (notificationManager['telegramNotificationManager']) {
            notificationManager['telegramNotificationManager']['bot'] = undefined; // Set bot to null
        }
        await notificationManager.sendTelegramNotification({
            receivers: ['receiver1'],
            message: 'Test message',
        } as TelegramParams);

        expect(console.log).toHaveBeenCalledWith('Telegram bot is not initialized');
    });

    it('should send messages to all receivers if the bot is initialized', async () => {
        const receivers = ['receiver1', 'receiver2'];
        const message = 'Test message';

        await notificationManager.sendTelegramNotification({ receivers, message } as TelegramParams);

        expect(mockBot.telegram.sendMessage).toHaveBeenCalledTimes(receivers.length);
        receivers.forEach(receiver => {
            expect(mockBot.telegram.sendMessage).toHaveBeenCalledWith(receiver, message, { parse_mode: 'MarkdownV2' });
        });
    });
});