import { Telegraf } from 'telegraf';
import { NotificationManager } from '../src/engine/notificationManager';
import { DelayedQueueData, EmmediatelyData } from '../src/types';
import { mock } from 'jest-mock-extended';

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
    let notificationManager: NotificationManager;

    beforeAll(() => {
        notificationManager = NotificationManager.create();
        notificationManager.InitQueue();
    });

    afterAll(async() => {
         await notificationManager.closeResources();
    });

    it('should send delayed notification', async () => {
        const data: DelayedQueueData = {
            type: 'delayed',
            item: 'notification',
            message: 'Hello',
            delay: 10000,
        };

        await expect(
            notificationManager.broadcastDelayedNotification(data),
        ).resolves.toBeInstanceOf(NotificationManager);
    });

    it('should send bulk immediate notifications', async () => {
        const data: EmmediatelyData[] = [
            {
                type: 'immediate',
                item: 'notification1',
                message: 'Hello 1',
                receivers: [2],
            },
            {
                type: 'immediate',
                item: 'notification2',
                message: 'Hello 2',
                receivers: [3],
            },
        ];

        await expect(
            notificationManager.bulkBroadcastEmmediatelyNotification(data),
        ).resolves.toBeInstanceOf(NotificationManager);
    });

    it('should send bulk delayed notifications', async () => {
        const data: DelayedQueueData[] = [
            {
                type: 'delayed',
                item: 'notification1',
                message: 'Hello 1',
                delay: 5000,
            },
            {
                type: 'delayed',
                item: 'notification2',
                message: 'Hello 2',
                delay: 10000,
            },
        ];

        await expect(
            notificationManager.bulkBroadcastDelayedNotification(data, 5000),
        ).resolves.toBeInstanceOf(NotificationManager);
    });

    it('should throw an error if receivers list is empty for immediate notification', async () => {
        const data: EmmediatelyData = {
            type: 'immediate',
            item: 'notification',
            message: 'Hello',
            receivers: [],
        };

        await expect(notificationManager.broadcastEmmediatelyNotification(data)).rejects.toThrow(
            'Receivers list is empty.',
        );
    });

    it('should throw an error if data is empty for bulk immediate notifications', async () => {
        const data: EmmediatelyData[] = [];

        await expect(
            notificationManager.bulkBroadcastEmmediatelyNotification(data),
        ).rejects.toThrow('Data is empty.');
    });

    it('should throw an error if delay is invalid for delayed notification', async () => {
        const data: DelayedQueueData = {
            type: 'delayed',
            item: 'notification',
            message: 'Hello',
            delay: -1000,
        };

        await expect(notificationManager.broadcastDelayedNotification(data)).rejects.toThrow(
            'Delay is invalid.',
        );
    });

    it('should throw an error if data is empty for bulk delayed notifications', async () => {
        const data: DelayedQueueData[] = [];

        await expect(
            notificationManager.bulkBroadcastDelayedNotification(data, 5000),
        ).rejects.toThrow('Data is empty.');
    });
});

describe('Telegraf telegram.sendMessage', () => {
    let notificationManager: NotificationManager;
    let mockBot: any;

    beforeAll(() => {
        notificationManager =  NotificationManager.create();
        notificationManager.InitTelegramConnection('fakeToken');
    });

    beforeEach(() => {
        mockBot = {
            telegram: {
                sendMessage: jest.fn(),
            },
        };
        notificationManager['bot'] = mockBot; // Inject the mock bot
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await notificationManager.closeResources();
    });

    it('should log a message if the bot is not initialized', async () => {
        console.log = jest.fn();
        notificationManager['bot'] = undefined; // Set bot to null
        //@ts-ignore
        await notificationManager.sendTelegramNotification({
            receivers: ['receiver1'],
            message: 'Test message',
        });

        expect(console.log).toHaveBeenCalledWith('telegram bot is not initialized');
    });

    it('should send messages to all receivers if the bot is initialized', async () => {
        const receivers = ['receiver1', 'receiver2'];
        const message = 'Test message';

        //@ts-ignore
        await notificationManager.sendTelegramNotification({ receivers, message });

        expect(mockBot.telegram.sendMessage).toHaveBeenCalledTimes(receivers.length);
        receivers.forEach(receiver => {
            expect(mockBot.telegram.sendMessage).toHaveBeenCalledWith(receiver, message, { parse_mode: 'MarkdownV2' });
        });
    });
});