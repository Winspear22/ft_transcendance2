import { SubscribeMessage, WebSocketGateway } from '@nestjs/webSockets';

@WebSocketGateway()
export class HomeGateway {
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
