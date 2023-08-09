import { 
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, ConnectedSocket } from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
import { UserService } from 'src/user/user.service';
import * as colors from '../colors';
import { JwtService } from '@nestjs/jwt';
import { decode, TokenExpiredError } from 'jsonwebtoken';  // Ne pas oublier d'importer les méthodes nécessaires
import { JwtPayload } from 'src/auth/interface/jwtpayload.interface';

@WebSocketGateway({cors: true, namespace: 'chats'})
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

/*@SubscribeMessage('Connection')
async handleConnection(@ConnectedSocket() client: Socket) {
    const accessTokenCookie = client.handshake.headers.cookie;
    console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.GREEN, client.connected, colors.RESET);

    if (!accessTokenCookie) {
        console.log('Access Token Cookie is missing.');
        return this.handleDisconnect(client);
    }

    console.log('Access Token Cookie:', accessTokenCookie);
    const decodedCookie = decodeURIComponent(accessTokenCookie); 
    const userData = JSON.parse(decodedCookie);
    const { username, refreshToken, accessToken } = userData;

    const decodedPayload = decode(accessToken) as JwtPayload;
    if (!decodedPayload) {
        console.log('Token is invalid or malformed.');
        return this.handleDisconnect(client);
    }

    const currentTime = Math.floor(Date.now() / 1000);
    console.log("EXP === ",  decodedPayload.exp);
    if (decodedPayload.exp && decodedPayload.exp < currentTime) {
        console.log('Token has expired.');
        return this.handleDisconnect(client);
    }

    let payload: JwtPayload;
    try {
        payload = await this.jwtService.verifyAsync(accessToken, {
            secret: process.env.ACCESS_TOKEN
        });
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            console.log('Token has expired.');
            return this.handleDisconnect(client);
        } else {
            console.log('Token is invalid:', error.message);
            return this.handleDisconnect(client);
        }
    }

    console.log("payload === ", payload);

    const user = await this.userService.findUserByUsername(username);
    client.data.user = user;
    console.log(client.data.user);

    if (user)
        return user;
    else
        return this.handleDisconnect(client); 
}*/

@SubscribeMessage('Connection')
async handleConnection(@ConnectedSocket() client: Socket) {
  const accessTokenCookie = client.handshake.headers.cookie;
  console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.GREEN, client.connected, colors.RESET);

  if (!accessTokenCookie) {
      console.log('Access Token Cookie is missing.');
      return this.handleDisconnect(client);
  }

  console.log('Access Token Cookie:', accessTokenCookie);
  const decodedCookie = decodeURIComponent(accessTokenCookie); 
  const userData = JSON.parse(decodedCookie);
  const { username, refreshToken, accessToken } = userData;

  // Vérifiez si le token est dans la liste noire
  if (await this.userService.isTokenBlacklisted(accessToken)) {
      console.log('Token is blacklisted.');
      return this.handleDisconnect(client);
  }

  const decodedPayload = decode(accessToken) as JwtPayload;
  if (!decodedPayload) {
      console.log('Token is invalid or malformed.');
      return this.handleDisconnect(client);
  }

  const currentTime = Math.floor(Date.now() / 1000);
  console.log("EXP === ",  decodedPayload.exp);
  if (decodedPayload.exp && decodedPayload.exp < currentTime) {
      console.log('Token has expired.');
      return this.handleDisconnect(client);
  }

  let payload: JwtPayload;
  try {
      payload = await this.jwtService.verifyAsync(accessToken, {
          secret: process.env.ACCESS_TOKEN
      });
  } catch (error) {
      if (error instanceof TokenExpiredError) {
          console.log('Token has expired.');
          return this.handleDisconnect(client);
      } else {
          console.log('Token is invalid:', error.message);
          return this.handleDisconnect(client);
      }
  }

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
