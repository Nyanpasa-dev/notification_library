import { verify, JwtPayload } from 'jsonwebtoken'
import * as http from 'http'
import { Client } from '../types'

export function handleConnection(
    ws: Client,
    req: http.IncomingMessage,
    clients: Set<Client>,
): void {
    if (!req.url) {
        ws.close(1008, 'URL not found')
        return
    }

    const token = req.url.split('authorization=')[1]

    if (!token) {
        ws.close(1008, 'Token not found')
        return
    }

    try {
        const decoded = verify(token, process.env['SECRET_KEY'] ?? '')
        ws.userId = (decoded as JwtPayload).id
        ws.telegram = (decoded as JwtPayload).telegram
        clients.add(ws)

        ws.send(JSON.stringify({ message: 'Подключение успешно установлено' }))
    } catch (err) {
        ws.close(1008, 'Token not verified')
        return
    }
}
