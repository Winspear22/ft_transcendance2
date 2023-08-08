import { 
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, ConnectedSocket } from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
import { UserService } from 'src/user/user.service';
import * as colors from '../colors';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  username: string;
  auth: boolean;
}

@WebSocketGateway({cors: true})
export class ChatGateway 
{
  constructor(private userService: UserService,
    private readonly jwtService: JwtService) {}

  @WebSocketServer()
  server: Server;
  
  @SubscribeMessage('message')
  handleMessage(@MessageBody() msg: string)
  {
    console.log("Message venant de la socket : ", msg);
    this.server.emit('message', msg);
  }

  @SubscribeMessage('Connection')
  async handleConnection(@ConnectedSocket() client: Socket) 
  {
    const accessTokenCookie = client.handshake.headers.cookie;
    console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.GREEN, client.connected, colors.RESET);

    if (!accessTokenCookie) {
      console.log('Access Token Cookie is missing.');
      return this.handleDisconnect(client);
    }
    // Faites ce que vous avez besoin de faire avec le jeton d'authentification.
      console.log('Access Token Cookie:', accessTokenCookie);
      const decodedCookie = decodeURIComponent(accessTokenCookie); // Décodez le cookie
      const userData = JSON.parse(decodedCookie);
      const { username } = userData;
      const { refreshToken } = userData;
      const { accessToken } = userData;
      console.log(username);
      console.log(refreshToken);
      console.log(accessToken);
      const payload: JwtPayload = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.ACCESS_TOKEN});
      //const payload: JwtPayload = this.jwtService.verify(accessToken, {secret: process.env.JWT_ACCESS_TOKEN_SECRET});
      console.log("payload === ", payload);
      const user = await this.userService.findUserByUsername(username);
      client.data.user = user;
      console.log(client.data.user);
      if (user)
        return user;
      else
        return this.handleDisconnect(client); 
  }

  handleDisconnect(client: Socket)
  {
    client.disconnect();
    console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.FG_RED, client.connected, colors.RESET);
  }
}
