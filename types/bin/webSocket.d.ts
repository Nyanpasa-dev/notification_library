import { Gateway, SendMessageParams, WebSocketConnection } from '../types/index.js';
declare class MyGateway implements Gateway {
    private clients;
    private heartbeatInterval;
    private server;
    private wss;
    private port;
    private isProduction;
    constructor({ port, isProduction }?: WebSocketConnection);
    private initializeModules;
    private setupWebSocketServer;
    close(): Promise<void>;
    private createServer;
    private handleConnection;
    private startHeartbeat;
    send({ key, data, receivers, message }: SendMessageParams): void;
}
export { MyGateway as WebSocket };
