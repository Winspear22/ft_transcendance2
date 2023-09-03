import { 
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import * as colors from '../colors';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/message.dto';
import { RoomService } from './room.service';
import { RoomEntity } from './entities/room.entity';
import { UseGuards } from '@nestjs/common';
import { ChatGuard } from './guard/chat-guard.guard';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomBanGuard } from './guard/chat-guard.guard';


@WebSocketGateway({cors: true, namespace: 'chats'})
export class ChatGateway 
{
  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
    @InjectRepository(RoomEntity)
    private roomRepository: Repository<RoomEntity>,
    ) {}
  
  private ref_client = new Map<string, number>()



  @WebSocketServer()
  server: Server;
  

  @UseGuards(ChatGuard)
  @SubscribeMessage('Connection')
  async handleConnection(@ConnectedSocket() client: Socket) 
  {
    const user = await this.chatService.getUserFromSocket(client);
    if (user == undefined)
    {
      console.log(colors.BRIGHT + colors.RED, "Error. Socket id : " + colors.WHITE + client.id + colors.RED + " could not connect." + colors.RESET);
      return this.handleDisconnect(client);
    }
    console.log(colors.BRIGHT + colors.GREEN, "User : " +  colors.WHITE + user.username + colors .GREEN +" just connected." + colors.RESET);
    
    this.ref_client.set(client.id, user.id);
    console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id : " + colors.WHITE + client.id + colors.RESET);
    console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id is in the handleConnection function: " + colors.WHITE + client.id + colors.RESET);

  }

  handleDisconnect(client: Socket)
  {
    client.disconnect();
    console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.FG_RED, client.connected, colors.RESET);
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('createRoom')
  async createRoom(@MessageBody() data: {
  channelName: string, 
  hasPassword: boolean,
  password?: string,
  isPrivate: boolean }, @ConnectedSocket() client: Socket)
  {
    if (data.channelName && data.channelName.length > 18) {
      return { success: false, error: 'Channel name too long (18 characters maximum)' };
    }
    
    const result = await this.roomService.createRoom(data, client);
    
    if (result.success) {
      this.server.emit('channelCreated', "Channel created : " + { channelName: data.channelName, isPrivate: data.isPrivate });
    }

    return result;
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('quitRoom')
  async quitRoom(@MessageBody() data: { 
  channelName: string }, @ConnectedSocket() client: Socket) {
    // Vérifier le nom du canal, l'accès utilisateur, etc. si nécessaire
    // Vous pouvez utiliser le même ChatGuard ou un autre guard pour faire ces vérifications
    
    const result = true;//await this.roomService.quitRoom(data, client);
    
    //if (result.success) {
      // Envoyer un message à tous les utilisateurs du canal pour les informer que l'utilisateur a quitté la salle
    //  this.server.to(data.channelName).emit('userLeft', { username: client.data.user.username, channelName: data.channelName });
   // }

    return result;
  }

  @UseGuards(ChatGuard, RoomBanGuard)
  @SubscribeMessage('joinRoom')
  async joinRoom(@MessageBody() data: {
  channelName: string, 
  password?: string }, @ConnectedSocket() client: Socket)
  {
    const result = await this.roomService.joinChannel(data, client);
    if (result.success)
      this.server.emit('channeljoined', client.data.user.username, "Channel joined : ", { channelName: data.channelName });
    else
    this.server.emit('channeljoined', "Error, there was a pb in joining the channel");

      return (result);
  }

}