import { 
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({cors: true})
export class ChatGateway 
{
  @WebSocketServer()
  server;
  
  @SubscribeMessage('message')
  handleMessage(@MessageBody() msg: string): string {
    console.log("Message venant de la socket : ", msg);
    this.server.emit('message', msg);
    return 'Hello toto';
  }
}
