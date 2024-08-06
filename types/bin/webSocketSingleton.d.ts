import { WebSocket } from './webSocket.js';
import { WebSocketConnection } from '../types';
declare class WebSocketSingleton {
    private static instance;
    private constructor();
    static getInstance(params?: WebSocketConnection): WebSocket;
}
export { WebSocketSingleton };
