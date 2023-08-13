import { 
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from 'src/user/user.service';
import * as colors from '../colors';
import { ChatService } from './chat.service';
import { ChatAuthService } from './chat-auth.service';
import { CreateMessageDto } from './dto/message.dto';
import { RoomService } from './room.service';


@WebSocketGateway({cors: true, namespace: 'chats'})
export class ChatGateway 
{
  constructor(private userService: UserService,
    private readonly chatService: ChatService,
    private readonly chatAuthService: ChatAuthService,
    private readonly roomService: RoomService
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
    /*J'EXTRAIS L'ACCESS TOKEN DU COOKIE*/
    const userData = this.chatAuthService.extractAccessTokenFromCookie(accessTokenCookie);
    if (!userData)
      return this.handleDisconnect(client);
    const { username, refreshToken, accessToken } = userData;
    /*JE VERIFIE SI LE TOKEN EST BLACKLISTE*/
    if (await this.chatAuthService.isTokenBlacklisted(accessToken)) {
      console.log('Token is blacklisted.');
      return this.handleDisconnect(client);
    }
    /*JE VERIFIE SI LE EST COMPLET*/
    const decodedPayload = this.chatAuthService.decodeAccessToken(accessToken);
    if (!decodedPayload) {
      console.log('Token is invalid or malformed.');
      return this.handleDisconnect(client);
    }
    /*JE VERIFIE SI LE TOKEN EST EXPIRE*/
    if (this.chatAuthService.hasTokenExpired(decodedPayload.exp)) {
      console.log('Token has expired.');
      return this.handleDisconnect(client);
    }
    /*JE VERIFIE SI LE TOKEN EST VALIDE AVEC VERIFYASYNC*/
    const payload = await this.chatAuthService.verifyToken(accessToken, process.env.ACCESS_TOKEN);
    if (!payload) {
      return this.handleDisconnect(client);
    }

    /*JE TROUVE L'UTILISATEUR ASSOCIE AU TOKEN*/
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

  @SubscribeMessage('newMessage')
  async handleNewMessage(@MessageBody() data: CreateMessageDto, @ConnectedSocket() client: Socket) {
    console.log("data = ", data);
    const newMessage = await this.chatService.createMessage(data);
    
    console.log("Message = ", newMessage);
    this.server.emit('newMessage', newMessage);
    return { status: 'Message sent and saved' };
}

  @SubscribeMessage('getAllMessages')
  async GetAllMessages() 
  {
    const messages = await this.chatService.getAllMessages();
    this.server.emit('getAllMessages', messages);
    return await this.chatService.getAllMessages();
  }
}
