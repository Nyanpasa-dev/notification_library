import * as https from 'https'
import * as http from 'http'
import { readFileSync } from 'fs'
import { WebSocketServer, WebSocket } from 'ws'
import { handleConnection } from '../helpers/connectionHandler'
import { Client, Gateway, MessageData, SendMessageParams, WebSocketConnection } from '../types'

class MyGateway implements Gateway {
    private clients: Set<Client>
    private heartbeatInterval: NodeJS.Timeout | undefined
    private server: http.Server | undefined
    private wss: WebSocketServer | undefined
    private port: number
    private isProduction: boolean

    constructor({ port = 4461, isProduction = false }: WebSocketConnection = {}) {
        this.clients = new Set<Client>()
        this.initializeModules()
        this.port = port
        this.isProduction = isProduction
    }

    private initializeModules(): void {
        try {
            this.setupWebSocketServer()
        } catch (error) {
            console.error((error as Error).message)
        }
    }

    private setupWebSocketServer(port?: number): void {
        this.server = this.createServer(this.isProduction)

        this.wss = new WebSocketServer({
            server: this.server,
            clientTracking: true,
        })

        this.wss.on('connection', (ws: Client, req) => {
            this.handleConnection(ws, req)
        })

        this.server.listen(this.port, () => {
            console.log(`WebSocket server started on port ${this.port}`)
        })

        this.server.on('error', (error: Error) => {
            console.error('WebSocket server error:', error.message)
        })

        this.startHeartbeat()
    }

    public async close(): Promise<void> {
        this.wss?.close()
        this.server?.close()
        clearInterval(this.heartbeatInterval as NodeJS.Timeout)
    }

    private createServer(isProduction: boolean): http.Server | https.Server {
        return isProduction
            ? https.createServer({
                  key: readFileSync(process.env.PRIV_KEY || ''),
                  cert: readFileSync(process.env.PRIV_CERT || ''),
              })
            : http.createServer()
    }

    private handleConnection(ws: Client, req: http.IncomingMessage): void {
        ws.isAlive = true
        handleConnection(ws, req, this.clients)

        ws.on('pong', () => {
            ws.isAlive = true
        })

        ws.on('close', () => {
            this.clients.delete(ws)
        })

        this.clients.add(ws)
    }

    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            this.wss?.clients.forEach((ws: WebSocket, _ws2: WebSocket, _set: Set<WebSocket>) => {
                const client = ws as Client
                if (!client.isAlive) {
                    return client.terminate()
                }

                client.isAlive = false
                client.ping()
            })
        }, 30000)
    }

    public send({ key, data, receivers = [], message = '' }: SendMessageParams): void {
        const messageData: MessageData = { key, data, message }
        const uniqueReceivers = [...new Set(receivers)]

        this.clients.forEach((client) => {
            if (
                client.readyState === WebSocket.OPEN &&
                uniqueReceivers.includes(Number(client.userId))
            ) {
                client.send(JSON.stringify(messageData))
            }
        })
    }
}

export { MyGateway as WebSocket }
