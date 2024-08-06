import jwt, { JwtPayload } from 'jsonwebtoken'
import * as http from 'http'
import { Client } from '../types/index.js'

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
        const decoded = jwt.verify(token, process.env['SECRET_KEY'] ?? '') as JwtPayload
        ws.userId = decoded.id
        ws.telegram = decoded.telegram

        ws.send(JSON.stringify({ message: 'Подключение успешно установлено' }))
    } catch (err) {
        ws.close(1008, 'Token not verified')
        return
    }
}
