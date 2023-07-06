import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
/* NE SERT A RIEN POUR LE MOMENT */
@WebSocketGateway(/*{cors: true}*/)
export class EventGateway {
  
  @SubscribeMessage('login')
  handleLoginEvent(client: any, payload: any): void 
  {
    console.log(payload); // Affiche le message dans la console
  }
}