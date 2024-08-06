import * as http from 'http';
import { Client } from '../types/index.js';
export declare function handleConnection(ws: Client, req: http.IncomingMessage, clients: Set<Client>): void;
