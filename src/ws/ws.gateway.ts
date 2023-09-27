import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import * as WebSocket from 'ws';

@WebSocketGateway(3026)
export class WsGateway implements OnGatewayInit {
  private logger: Logger = new Logger('WsGateway');

  @WebSocketServer()
  server: WebSocket;

  afterInit(server: WebSocket) {
    this.logger.log('Initialized');
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  @SubscribeMessage('receive')
  handleReceive(client: any, payload: any) {
    this.logger.log(`Received data from Adonis API: ${JSON.stringify(payload)}`);
  }
}
