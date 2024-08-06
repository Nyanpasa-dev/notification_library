import { WebSocket } from './webSocket.js';
import { WebSocketConnection } from '../types';

class WebSocketSingleton {
    private static instance: WebSocket;

    private constructor() {}

    public static getInstance(params?: WebSocketConnection): WebSocket {
      if (!WebSocketSingleton.instance) {
            console.log('Creating new WebSocket instance');
            WebSocketSingleton.instance = new WebSocket(params);
        }
        return WebSocketSingleton.instance;
    }
}

export { WebSocketSingleton };