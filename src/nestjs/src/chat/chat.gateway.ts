import { 
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from 'src/user/user.service';
import * as colors from '../colors';
import { ChatService } from './chat.service';


@WebSocketGateway({cors: true, namespace: 'chats'})
export class ChatGateway 
{
  constructor(private userService: UserService,
    private readonly chatService: ChatService,
    ) {}

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

    if (!accessTokenCookie) 
    {
        console.log('Access Token Cookie is missing.');
        return this.handleDisconnect(client);
    }

    const userData = this.chatService.extractAccessTokenFromCookie(accessTokenCookie);
    if (!userData)
      return this.handleDisconnect(client);
    const { username, refreshToken, accessToken } = userData;

    if (await this.chatService.isTokenBlacklisted(accessToken)) {
      console.log('Token is blacklisted.');
      return this.handleDisconnect(client);
    }

    const decodedPayload = this.chatService.decodeAccessToken(accessToken);
    if (!decodedPayload) {
      console.log('Token is invalid or malformed.');
      return this.handleDisconnect(client);
    }

    if (this.chatService.hasTokenExpired(decodedPayload.exp)) {
      console.log('Token has expired.');
      return this.handleDisconnect(client);
    }

    const payload = await this.chatService.verifyToken(accessToken, process.env.ACCESS_TOKEN);
    if (!payload) {
      return this.handleDisconnect(client);
    }

    //console.log("payload === ", payload);

    const user = await this.userService.findUserByUsername(username);
    client.data.user = user;
    //console.log(client.data.user);

    if (user)
      console.log("User connected : ", user.username);
      //return user;
    else
    {
      console.log('User does not exist');
      return this.handleDisconnect(client);
    }
  }

  handleDisconnect(client: Socket)
  {
    client.disconnect();
    console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.FG_RED, client.connected, colors.RESET);
  }
}
