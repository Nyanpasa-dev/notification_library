import { Telegraf } from 'telegraf'
import { NotificationManager } from '../src/engine/notificationManager'
import { DelayedQueueData, TelegramParams } from '../src/types'


describe('NotificationManager', () => {
    let notificationManager: NotificationManager

    beforeAll(() => {
        notificationManager = new NotificationManager({})
    })

    afterAll(async () => {
        // Close WebSocket server
        await notificationManager.closeResources()
    })

    it('should send delayed notification', async () => {
        const data: DelayedQueueData = {
            type: 'delayed',
            item: 'notification',
            message: 'Hello',
            delay: 10000, // Убедитесь, что значение задержки является допустимым
        }

        await expect(
            notificationManager.broadcastDelayedNotification(data),
        ).resolves.toBeInstanceOf(NotificationManager)
    })

    it('should send bulk immediate notifications', async () => {
        const data = [
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
        ]

        await expect(
            notificationManager.bulkBroadcastEmmediatelyNotification(data),
        ).resolves.toBeInstanceOf(NotificationManager)
    })

    it('should send bulk delayed notifications', async () => {
        const data = [
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
        ]

        await expect(
            notificationManager.bulkBroadcastDelayedNotification(data, 5000),
        ).resolves.toBeInstanceOf(NotificationManager)
    })

    it('should throw an error if receivers list is empty for immediate notification', async () => {
        const data = {
            type: 'immediate',
            item: 'notification',
            message: 'Hello',
            receivers: [],
        }

        await expect(notificationManager.broadcastEmmediatelyNotification(data)).rejects.toThrow(
            'Receivers list is empty.',
        )
    })

    it('should throw an error if data is empty for bulk immediate notifications', async () => {
        const data: any[] = []

        await expect(
            notificationManager.bulkBroadcastEmmediatelyNotification(data),
        ).rejects.toThrow('Data is empty.')
    })

    it('should throw an error if delay is invalid for delayed notification', async () => {
        const data = {
            type: 'delayed',
            item: 'notification',
            message: 'Hello',
            delay: -1000,
        }

        await expect(notificationManager.broadcastDelayedNotification(data)).rejects.toThrow(
            'Delay is invalid.',
        )
    })

    it('should throw an error if data is empty for bulk delayed notifications', async () => {
        const data: any[] = []

        await expect(
            notificationManager.bulkBroadcastDelayedNotification(data, 5000),
        ).rejects.toThrow('Data is empty.')
    })

})
