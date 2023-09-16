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
import { Body, UseGuards } from '@nestjs/common';
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
    this.emitAvailableRooms(client);
    console.log(colors.BRIGHT + colors.GREEN, "User : " +  colors.WHITE + user.username + colors .GREEN +" just connected." + colors.RESET);
    this.ref_client.set(user.id, client.id);
    this.ref_socket.set(client, client.id);
    console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id : " + colors.WHITE + client.id + colors.RESET);
    console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id is in the handleConnection function: " + colors.WHITE + client.id + colors.RESET);

  }

  handleDisconnect(client: Socket)
  {
    client.disconnect();
    for (let [socket, id] of this.ref_socket.entries()) {
      if (socket === client) {
          console.log(colors.GREEN, "La Socket " + colors.WHITE + socket.id + colors.GREEN + " a ete supprimee de la mao !")
          this.ref_socket.delete(socket);
          break;
      }
    }
    console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.FG_RED, client.connected, colors.RESET);
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('emitAvailableRooms')
  async emitAvailableRooms(@ConnectedSocket() client: Socket) {
    const rooms = await this.roomService.getRooms(client);
    return await this.server.to(client.id).emit('emitAvailableRooms', rooms); // Pas sur, il faut que ca puisse envoyer a tout le monde.
  }

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
    const channelNameRegex = /^[a-zA-Z0-9]{2,12}$/;

    if (!channelNameRegex.test(data.channelName)) {
      this.server.emit('createRoom', "Channel name is invalid. It should be 2-12 characters long and alphanumeric only.'");
      return { success: false, error: 'Channel name is invalid. It should be 2-12 characters long and alphanumeric only.' };
    }
    const result = await this.roomService.createRoom(data, client);

    if (result.success) {
      this.server.emit('createRoom', "Channel created : " + data.channelName );
    } else {
      this.server.emit('createRoom', "Error. Channel " + data.channelName + " was not created.");
    }
    return result;
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('quitRoom')
  async quitRoom(@MessageBody() data: { 
  channelName: string }, @ConnectedSocket() client: Socket) {
    const result = await this.roomService.quitRoom(data, client);

    if (result.success) 
    {
      console.log("Je suis dans quitRoom");
      this.server.to(client.id).emit('quitRoom', "You have left the room " + data.channelName);
      this.server.to(data.channelName).emit('quitRoom', client.data.user.username + " has left the room " + data.channelName);
      client.leave(data.channelName);
    }
    return result;
  }

  // NE PAS OUBLIER DE REGLER LE DETAILS AVEC LE MDP
  @UseGuards(ChatGuard, RoomBanGuard)
  @SubscribeMessage('joinRoom')
  async joinRoom(@MessageBody() data: {
  channelName: string, 
  password?: string }, @ConnectedSocket() client: Socket)
  {
    const result = await this.roomService.joinRoom(data, client);
    if (result.success)
    {
      this.server.to(client.id).emit('joinRoom', "Room joined : " + data.channelName);
      client.join(data.channelName);
      return (result);
    }
    else
    {
      this.server.to(client.id).emit('joinRoom', "Error, there was a problem in joining the room : " + data.channelName);
      return (result);
    }
  }

  //--------------------------------------------------------------------------------------//


  //--------------------------------------------------------------------------------------//
  //-----------------------------POUVOIRS DES OWNERS/ADMINS-------------------------------//
  //--------------------------------------------------------------------------------------//

  //------------------------------BANNIR/DEBANNIR LES USERS-------------------------------//

  @UseGuards(ChatGuard)
  @SubscribeMessage('banUser')
  async banUserFromRoom(@MessageBody() data: {
  channelName: string, 
  targetUsername: string }, @ConnectedSocket() client: Socket)
  {
    const result = await this.roomService.banUserfromRoom(data, client);
    if (result.success) {
      const bannedUser = await this.usersRepository.findOne({ where: { username: data.targetUsername } });
      const targetSocketId = this.ref_client.get(bannedUser.id);
      const targetSocket = [...this.ref_socket.keys()].find(socket => this.ref_socket.get(socket) === targetSocketId);
      //if (targetSocket)
      //    targetSocket.leave(data.channelName);
      //this.server.emit('banUser', "User ", data.targetUsername, " has been banned from room ", data.channelName);

    if (targetSocket) {
      // Émettre l'événement pour informer l'administrateur
      this.server.to(client.id).emit('banUser', {
        message: `You have successfully banned ${data.targetUsername} from room ${data.channelName}`,
    });
        // Émettre l'événement pour informer l'utilisateur banni
        targetSocket.emit('banned', {
            message: `You have been banned from room ${data.channelName} by an administrator.`,
        });
        
        // Émettre l'événement pour informer la salle
        this.server.to(data.channelName).emit('userBanned', {
            username: data.targetUsername,
            message: `User ${data.targetUsername} has been banned from this room by an administrator.`,
        });
      
        return (result);
      }
    }
    else
    {
      this.server.to(client.id).emit('banUser', "Error, there was a problem the user was not banned.");
      return (result);
    }
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('unbanUser')
  async unbanUserFromRoom(@MessageBody() data: {
  channelName: string, 
  targetUsername: string }, @ConnectedSocket() client: Socket)
  {
    const result = await this.roomService.unbanUserfromRoom(data, client);
    if (result.success) {
      //this.server.emit('unbanUser', "User " + data.targetUsername + " has been unbanned from room " + data.channelName);
      
      const bannedUser = await this.usersRepository.findOne({ where: { username: data.targetUsername } });
      const targetSocketId = this.ref_client.get(bannedUser.id);
      const targetSocket = [...this.ref_socket.keys()].find(socket => this.ref_socket.get(socket) === targetSocketId);

    if (targetSocket) {
      // Émettre l'événement pour informer l'administrateur
      this.server.to(client.id).emit('unbanUser', {
        message: `You have successfully unbanned ${data.targetUsername} from room ${data.channelName}`,
    });
        // Émettre l'événement pour informer l'utilisateur banni
        targetSocket.emit('unbanned', {
            message: `You have been unbanned from room ${data.channelName} by an administrator.`,
        });
        
        // Émettre l'événement pour informer la salle
        this.server.to(data.channelName).emit('userunBanned', {
            username: data.targetUsername,
            message: `User ${data.targetUsername} has been unbanned from this room by an administrator.`,
        });
      
        return (result);
      }
    }
    else {
      this.server.emit('unbanUser', "Error unbanning user " + data.targetUsername, " from room " + data.channelName);
    }
    return result;
  }

  //--------------------------------------------------------------------------------------//

  //------------------------------------KICK LES USERS------------------------------------//

  @UseGuards(ChatGuard)
  @SubscribeMessage('kickUser')
  async kickUserFromRoom(@MessageBody() data: {
  channelName: string, 
  targetUsername: string }, @ConnectedSocket() client: Socket)
  {
    const result = await this.roomService.kickUserChannel(data, client);
    if (result.success) {
      const bannedUser = await this.usersRepository.findOne({ where: { username: data.targetUsername } });
      const targetSocketId = this.ref_client.get(bannedUser.id);
      const targetSocket = [...this.ref_socket.keys()].find(socket => this.ref_socket.get(socket) === targetSocketId);
      if (targetSocket) {
        // Émettre l'événement pour informer l'administrateur
        this.server.to(client.id).emit('kickUser', {
          message: `You have successfully kicked ${data.targetUsername} from room ${data.channelName}`,
      });
          // Émettre l'événement pour informer l'utilisateur banni
          targetSocket.emit('kicked', {
              message: `You have been kicked from room ${data.channelName} by an administrator.`,
          });
          
          // Émettre l'événement pour informer la salle
          this.server.to(data.channelName).emit('userKicked', {
              username: data.targetUsername,
              message: `User ${data.targetUsername} has been kicked from this room by an administrator.`,
          });
        
          return (result);
        }
    }
    else
    {
      this.server.to(client.id).emit('kickUser', "Error, there was a problem the user was not kicked.");
      return (result);
    }
  }

  //--------------------------------------------------------------------------------------//
  
  //------------------------------------MUTE LES USERS------------------------------------//
  
  @UseGuards(ChatGuard)
  @SubscribeMessage('muteUser')
  async muteUser(@MessageBody() data: {
  username: string; 
  roomName: string; 
  targetUsername: string; 
  duration: number }, 
  @ConnectedSocket() client: Socket) 
  {
    
    const result = await this.roomService.muteUserRoom(data);
    
    if (result.success) {
      const mutedUser = await this.usersRepository.findOne({ where: { username: data.targetUsername } });
      const targetSocketId = this.ref_client.get(mutedUser.id);

      this.server.to(client.id).emit('muteUser', "User " + data.targetUsername + " has been muted for " + data.duration);
      this.server.to(targetSocketId).emit('muted', "You have been muted by an administrator for " + data.duration);

      this.server.to(data.roomName).emit('userMuted', {
          message: `${data.targetUsername} has been muted for ${data.duration} seconds.`,
          targetUsername: data.targetUsername,
          duration: data.duration
      });
      return (result);

    } else {
        this.server.to(client.id).emit('userMuted', {
            error: result.error
        });
    }

    return result;
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('unmuteUser')
  async unmuteUser(
    @MessageBody() data: {
    username: string,
    roomName: string,
    targetUsername: string}, 
    @ConnectedSocket() client: Socket) 
    {
      const result = await this.roomService.unmuteUserRoom(data);
      
      if (result.success) {
          const unmutedUser = await this.usersRepository.findOne({ where: { username: data.targetUsername } });
          const targetSocketId = this.ref_client.get(unmutedUser.id);

          this.server.to(client.id).emit('unmuteUser', "User " + data.targetUsername + " has been unmuted");
          this.server.to(targetSocketId).emit('unmuted', "You have been unmuted by an administrator");

          this.server.to(data.roomName).emit('userUnmuted', {
              message: `${data.targetUsername} has been unmuted.`,
              targetUsername: data.targetUsername
          });
          return result;
      } else {
          this.server.to(client.id).emit('userUnmuted', {
              error: result.error
          });
      }

      return result;
    }


  
  //--------------------------------------------------------------------------------------//

  //--------------------------------------------------------------------------------------//
  //---------------------------------GESTION DES MESSAGES---------------------------------//
  //--------------------------------------------------------------------------------------//
  
  
  @SubscribeMessage('sendMessage')
  async handleMessage(@ConnectedSocket() client: Socket,
  @MessageBody() body: { channelName: string,
  senderUsername: string,
  message: string }): Promise<void> {
    const sender = await this.chatService.getUserFromSocket(client);
    //const receiver = await this.usersRepository.findOne({ where: { username: body.receiverUsername } });
    const room = await this.roomService.getRoomByName(body.channelName);
    if (room.mutedIds.includes(sender.id))
    {
      this.server.to(client.id).emit('sendMessage', "Error, you have been muted.");
      return ;
    }

    if (body.message.length === 0) {
      return;
    }

    // Créez le message avec TypeORM
    const message = new MessageEntity();
    message.room = room;
    message.senderId = sender.id;
    message.text = body.message;
    message.channelId = room.id;

    const savedMessage = await this.messagesRepository.save(message);

    // Émettez le message aux clients
    this.server.to(savedMessage.room.roomName).emit('sendMessage', savedMessage, { senderUsername: sender.username, senderpp: sender.profile_picture});
    /*this.server.to(message.room.roomName).emit('message', {
      senderId: sender.id,
      text: body.message,
      time: message.createdAt,
      username: sender.username,
      avatar: sender.profile_picture
    });*/
  }
}