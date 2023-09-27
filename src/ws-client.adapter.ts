import {
  WebSocketAdapter,
  INestApplicationContext,
  WsMessageHandler,
} from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import * as WebSocket from 'ws';

export class WsClientAdapter implements WebSocketAdapter {
  private ws: WebSocket;

  constructor(private app: INestApplicationContext) {}
  bindClientDisconnect(client: any, callback: Function) {
    client.on('close', callback);
  }

  bindMessageHandlers(
    client: any,
    handlers: WsMessageHandler<string>[],
    transform: (data: any) => Observable<any>,
  ) {
    handlers.forEach(({ message, callback }) => {
      client.on(message, (data) => {
        const source$ = transform(data);
        source$.subscribe((response) => callback(response, client));
      });
    });
  }

  close(server: any) {
    server.close();
  }

  create(port: number, options?: WebSocket.ClientOptions) {
    this.ws = new WebSocket('ws://192.168.1.124:3333/ws', options || {});
    this.ws.on('open', () => {
      this.ws.send(JSON.stringify({ topic: 'realtime:*', event: 'subscribe' }));
    });
    this.ws.on('message', (message) => {
      console.log(message);
    });
    return this.ws;
  }

  // implement the bindClientConnect method
  bindClientConnect(server: any, callback: Function) {
    server.on('connection', callback);
  }

  // other methods omitted for brevity
}
