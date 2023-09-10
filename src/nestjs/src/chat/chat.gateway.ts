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
import { UserEntity } from 'src/user/user.entity';
import { MessageEntity } from './entities/message.entity';
import { FriendMessage } from 'src/user/entities/friendmessage.entity';
import { Friend } from 'src/user/entities/friend.entity';
import { FriendChat } from 'src/user/entities/friendchat.entity';


@WebSocketGateway({cors: true, namespace: 'chats'})
export class ChatGateway 
{
  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
    @InjectRepository(RoomEntity)
    private roomRepository: Repository<RoomEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(MessageEntity)
    private messagesRepository: Repository<MessageEntity>,
    @InjectRepository(Friend)
    private friendsRepository: Repository<Friend>,
    @InjectRepository(FriendChat)
    private friendChatsRepository: Repository<FriendChat>,
    @InjectRepository(FriendMessage)
    private friendMessageRepository: Repository<FriendMessage>,
    ) {}
  
  private ref_client = new Map<number, string>()
  private ref_socket = new Map<Socket, string>()


  @WebSocketServer()
  server: Server;
  
  //--------------------------------------------------------------------------------------//
  //---------------------------------CONNEXION/DECONNEXION--------------------------------//
  //--------------------------------------------------------------------------------------//

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
    this.emitRooms(client);
    console.log(colors.BRIGHT + colors.GREEN, "User : " +  colors.WHITE + user.username + colors .GREEN +" just connected." + colors.RESET);
    this.ref_client.set(user.id, client.id);
    this.ref_socket.set(client, client.id);
    console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id : " + colors.WHITE + client.id + colors.RESET);
    console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id is in the handleConnection function: " + colors.WHITE + client.id + colors.RESET);

  }

  handleDisconnect(client: Socket)
  {
    client.disconnect();
    console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.FG_RED, client.connected, colors.RESET);
  }

  /*@UseGuards(ChatGuard)
  @SubscribeMessage('emitRooms')
  async emitChannels(@ConnectedSocket() client: Socket) {
    const channels = await this.roomService.getRooms(client);
    return await this.server.to(client.id).emit('emitRooms', channels); // Pas sur, il faut que ca puisse envoyer a tout le monde.
  }*/

  @UseGuards(ChatGuard)
  @SubscribeMessage('emitRooms')
  async emitRooms(@ConnectedSocket() client: Socket) 
  {
    const user = await this.chatService.getUserFromSocket(client);

    if (!user) {
      console.log("User not found");
      return;
    }

    // Récupérez tous les channels auxquels l'utilisateur appartient
    const rooms = await this.roomRepository
        .createQueryBuilder('channel')
        .where(':userId = ANY(channel.users)', { userId: user.id })  // Utilisez ANY pour vérifier l'appartenance à un tableau
        .leftJoinAndSelect('channel.messages', 'message')
        .getMany();

    console.log("rooms de l'utilisateur:", rooms);

    // Faites rejoindre l'utilisateur à tous ses rooms
    rooms.forEach(channel => {
        client.join(channel.roomName); // Supposons que roomName soit unique pour chaque channel
    });
    console.log("rooms rejoint par l'utilisateur: ", client.rooms);

    // Retournez les rooms à l'utilisateur
    console.log("Je suis connecté : ", client.rooms);
    return await this.server.to(client.id).emit('emitRooms', rooms);
  }


  //--------------------------------------------------------------------------------------//
  //------------------------------------GESTION DES DMS-----------------------------------//
  //--------------------------------------------------------------------------------------//


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
    const result = await this.roomService.quitChannel(data, client);
    if (result.success) {
      client.leave(data.channelName);
      this.server.to(data.channelName).emit('userLeft', { username: client.data.user.username, channelName: data.channelName });
    }

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
    {
      this.server.emit('channeljoined', client.data.user.username, "Channel joined : ", { channelName: data.channelName });
      client.join(data.channelName);
      client.on('disconnect', () => {
        client.leave(data.channelName);
      });
      return (result);
    }
    else
    {
      this.server.emit('channeljoined', "Error, there was a pb in joining the channel");
      return (result);
    }
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('getRooms')
  async getChannels(@ConnectedSocket() client: Socket) {
    const channels = await this.roomService.getRooms(client);
    //await this.server.to(client.id).emit('channel', channels);
    return channels;
  }

      /*async emitChannelForConnectedUsers() {
        const connections: ConnectedUserI[] = await this.connectedUserService.findAll();
        for (const connection of connections) {
            const channels: ChannelI[] = await this.channelService.getChannelsForUser(connection.user.userId);
            await this.server.to(connection.socketId).emit('channel', channels);
        }
    }*/

  // Ajout de la méthode getYourChannels
  @UseGuards(ChatGuard)
  @SubscribeMessage('getYourRooms')
  async getYourChannels(@ConnectedSocket() client: Socket) {
    const yourChannels = await this.roomService.getYourRooms(client);
    return yourChannels;
  }

  // Ajout de la méthode getChannelMessages
  @UseGuards(ChatGuard)
  @SubscribeMessage('getRoomMessages')
  async getChannelMessages(body: { roomName: string; }, @ConnectedSocket() client: Socket) {
    const channelMessages = await this.roomService.getRoomMessages(body, client);
    return channelMessages;
  }

  /*@UseGuards(ChatGuard)
  @SubscribeMessage('sendDM')
  async handleDMs(@MessageBody() body: { room: string,
  senderUsername: string,
  message: string,
  receiverUsername: string }, @ConnectedSocket() client: Socket): Promise<void> {
    const sender = await this.chatService.getUserFromSocket(client);//await this.usersRepository.findOne({ where: { username: body.senderUsername } });
    const receiver = await this.usersRepository.findOne({ where: { username: body.receiverUsername } });
    console.log("Is this.server instance of Server?", this.server instanceof require("socket.io").Server);
    console.log("Is this.server.sockets instance of Namespace?", this.server.sockets instanceof require("socket.io").Namespace);
    
    if (!sender || !receiver) {
      return;
    }

    if (body.message.length === 0) {
      return;
    }
    const roomId = await this.roomService.getRoomByName(body.room);
    const newMessage = this.messagesRepository.create({
      senderId: sender.id,
      text: body.message,
      channelId: roomId.id
    });
    const savedMessage = await this.messagesRepository.save(newMessage);
    const receiverSocketId = this.ref_client.get(receiver.id);
    console.log(receiverSocketId);
    console.log(this.ref_client);

    if (receiverSocketId !== undefined) {
      // Utilisez l'ID de la socket pour envoyer un message ou pour d'autres opérations
      // Par exemple, avec Socket.io, vous pouvez faire quelque chose comme ceci :
      this.server.to(receiverSocketId).emit("sendDM", newMessage.text);
    } //else {
      // Gérez le cas où l'ID de l'utilisateur n'existe pas dans la Map
    //}
    //this.server.emit('sendDM', { senderId: sender.id, text: body.message, time: savedMessage.createdAt, username: sender.username });
  }*/


  //--------------------------------------------------------------------------------------//
  //---------------------------------GESTION DES MESSAGES---------------------------------//
  //--------------------------------------------------------------------------------------//
  
  @UseGuards(ChatGuard)
  @SubscribeMessage('joinDM')
  joinDM(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string }): void {
    socket.join(body.room);
    socket.on('disconnect', () => {
      socket.leave(body.room);
    });
    this.server.emit('joinDM', body.room);
  }
  
  @UseGuards(ChatGuard)
  @SubscribeMessage('sendDM')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string, senderUsername: string, message: string, receiverUsername: string }
  ): Promise<void> 
  {

    let chat = await this.friendChatsRepository.findOne({
      where: { room: body.room }
    });
    if (!chat) 
    {
      chat = new FriendChat();
      chat.room = body.room;
      chat = await this.friendChatsRepository.save(chat);
    }

    const sender = await this.chatService.getUserFromSocket(client);
    const receiver = await this.usersRepository.findOne({ where: { username: body.receiverUsername } });
    if (!sender || !receiver) {
      return;
    }

    if (receiver.blockedIds && receiver.blockedIds.includes(sender.id)) {
      return;
    }
    
    if (sender.blockedIds && sender.blockedIds.includes(receiver.id)) {
      return;
    }

    if (body.message.length === 0) {
      return;
    }

    const newMessage = new FriendMessage();
    newMessage.chat = chat;
    newMessage.senderId = sender.id;
    newMessage.text = body.message;

    const savedMessage = await this.friendMessageRepository.save(newMessage);

    const receiverSocketId = this.ref_client.get(receiver.id);
    console.log(receiverSocketId);
    console.log(this.ref_client);

    if (receiverSocketId !== undefined) {
      this.server.to(receiverSocketId).emit("sendDM", savedMessage);
  }
}
}