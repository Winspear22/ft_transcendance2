import { 
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, ConnectedSocket } from '@nestjs/webSockets';
import { Socket, Server } from 'Socket.io';
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
  
  // Map pour stocker les références entre l'ID utilisateur et l'ID de Socket
  private ref_client = new Map<number, string>()

  // Map pour stocker les références entre l'objet Socket et l'ID de Socket
  private ref_Socket = new Map<Socket, string>()

  // Instance du serveur WebSocket
  @WebSocketServer()
  server: Server;

  //--------------------------------------------------------------------------------------//
  //---------------------------------CONNEXION/DECONNEXION--------------------------------//
  //--------------------------------------------------------------------------------------//

  // Gère la connexion d'un utilisateur au serveur WebSocket.
  // Authentifie l'utilisateur et stocke ses informations dans les maps.
  // Envoie également à l'utilisateur la liste des rooms et des rooms disponibles.
  @UseGuards(ChatGuard)
  @SubscribeMessage('Connection')
  async handleConnection(@ConnectedSocket() client: Socket) 
  {
    const user = await this.chatService.getUserFromSocket(client);
    if (!user) {
      console.log(colors.BRIGHT + colors.RED, "Erreur. Socket id : " + colors.WHITE + client.id + colors.RED + " n'a pas pu se connecter." + colors.RESET);
      return this.handleDisconnect(client);
    }
    this.emitRooms(client);
    this.emitAvailableRooms(client);
    console.log(colors.BRIGHT + colors.GREEN, "Utilisateur : " +  colors.WHITE + user.username + colors .GREEN +" vient de se connecter." + colors.RESET);
    this.ref_client.set(user.id, client.id);
    this.ref_Socket.set(client, client.id);
  }

  // Gère la déconnexion d'un utilisateur du serveur WebSocket.
  // Supprime également l'utilisateur des maps.
  handleDisconnect(client: Socket)
  {
    client.disconnect();
    for (let [Socket, id] of this.ref_Socket.entries()) {
      if (Socket === client) {
          console.log(colors.GREEN, "La Socket " + colors.WHITE + Socket.id + colors.GREEN + " a été supprimée de la map !");
          this.ref_Socket.delete(Socket);
          break;
      }
    }
  }

  // Renvoie une liste des rooms disponibles à l'utilisateur.
  @UseGuards(ChatGuard)
  @SubscribeMessage('emitAvailableRooms')
  async emitAvailableRooms(@ConnectedSocket() client: Socket) {
    const rooms = await this.roomService.getRooms(client);
    return await this.server.to(client.id).emit('emitAvailableRooms', rooms);
  }

  // Récupère et renvoie à l'utilisateur la liste des rooms auxquels il appartient.
  // Fait également rejoindre l'utilisateur à tous ces rooms.
  @UseGuards(ChatGuard)
  @SubscribeMessage('emitRooms')
  async emitRooms(@ConnectedSocket() client: Socket) 
  {
    const user = await this.chatService.getUserFromSocket(client);

    if (!user) {
      console.log("Utilisateur non trouvé");
      return;
    }

    // Récupération de tous les rooms auxquels l'utilisateur appartient
    const rooms = await this.roomRepository
        .createQueryBuilder('channel')
        .where(':userId = ANY(channel.users)', { userId: user.id })
        .leftJoinAndSelect('channel.messages', 'message')
        .getMany();

    // Ajout de l'utilisateur à tous ses rooms
    rooms.forEach(channel => {
        client.join(channel.roomName);
    });

    // Envoi des rooms à l'utilisateur
    return await this.server.to(client.id).emit('emitRooms', rooms);
  }


  //--------------------------------------------------------------------------------------//
  //------------------------------------GESTION DES DMS-----------------------------------//
  //--------------------------------------------------------------------------------------//

    /**
   * Crée une nouvelle salle de chat.
   * 
   * @param data - Contient les informations nécessaires pour créer une salle, y compris le nom, si elle a un mot de passe, le mot de passe (facultatif) et si elle est privée.
   * @param client - L'objet Socket représentant le client qui émet l'événement.
   * @returns Un objet avec une clé "success" indiquant si l'opération a réussi ou non, ainsi que des messages d'erreur potentiels.
   */
  @UseGuards(ChatGuard)
  @SubscribeMessage('createRoom')
  async createRoom(@MessageBody() data: {
    channelName: string, 
    hasPassword: boolean,
    password?: string,
    isPrivate: boolean }, @ConnectedSocket() client: Socket)
  {
      // Validation du nom de la salle
      const channelNameRegex = /^[a-zA-Z0-9]{2,12}$/;
      if (!channelNameRegex.test(data.channelName)) {
        this.server.emit('createRoom', "Channel name is invalid. It should be 2-12 characters long and alphanumeric only.'");
        return { success: false, error: 'Channel name is invalid. It should be 2-12 characters long and alphanumeric only.' };
      }

      // Création de la salle en utilisant le service roomService
      const result = await this.roomService.createRoom(data, client);

      // Notification aux clients du résultat de la création
      if (result.success) {
        this.server.emit('createRoom', "Channel created : " + data.channelName );
      } else {
        this.server.emit('createRoom', "Error. Channel " + data.channelName + " was not created.");
      }
      return result;
  }

  /**
   * Permet à un utilisateur de quitter une salle de chat.
   * 
   * @param data - Contient le nom de la salle à quitter.
   * @param client - L'objet Socket représentant le client qui émet l'événement.
   * @returns Un objet avec une clé "success" indiquant si l'opération a réussi ou non, ainsi que des messages d'erreur potentiels.
   */
  @UseGuards(ChatGuard)
  @SubscribeMessage('quitRoom')
  async quitRoom(@MessageBody() data: { 
    channelName: string }, @ConnectedSocket() client: Socket) {
      // Utilise le service roomService pour quitter la salle
      const result = await this.roomService.quitRoom(data, client);

      // Notifications sur le succès de l'opération
      if (result.success) 
      {
        console.log("Je suis dans quitRoom");
        this.server.to(client.id).emit('quitRoom', "You have left the room " + data.channelName);
        this.server.to(data.channelName).emit('quitRoom', client.data.user.username + " has left the room " + data.channelName);
        client.leave(data.channelName);
      }
      return result;
  }

  /**
   * Permet à un utilisateur de rejoindre une salle de chat.
   * 
   * @param data - Contient le nom de la salle à rejoindre et le mot de passe (facultatif) si nécessaire.
   * @param client - L'objet Socket représentant le client qui émet l'événement.
   * @returns Un objet avec une clé "success" indiquant si l'opération a réussi ou non, ainsi que des messages d'erreur potentiels.
   */
  @UseGuards(ChatGuard, RoomBanGuard)
  @SubscribeMessage('joinRoom')
  async joinRoom(@MessageBody() data: {
    channelName: string, 
    password?: string }, @ConnectedSocket() client: Socket)
  {
      // Utilise le service roomService pour rejoindre la salle
      const result = await this.roomService.joinRoom(data, client);
      if (result.success)
      {
        // Notifications sur le succès de l'opération
        this.server.to(client.id).emit('joinRoom', "Room joined : " + data.channelName);
        this.server.to(data.channelName).emit('joinRoom', client.data.user.username + " just joined the room " + data.channelName);
        client.join(data.channelName);
        return (result);
      }
      else
      {
        // En cas d'erreur lors de la tentative de rejoindre
        this.server.to(client.id).emit('joinRoom', "Error, there was a problem in joining the room : " + data.channelName);
        return (result);
      }
  }

  /**
   * Permet à un administrateur de bannir un utilisateur d'une salle de chat.
   * 
   * @param data - Contient le nom de la salle et le nom d'utilisateur de la personne à bannir.
   * @param client - L'objet Socket représentant le client qui émet l'événement.
   * @returns Un objet avec une clé "success" indiquant si l'opération a réussi ou non, ainsi que des messages d'erreur potentiels.
   */
  @UseGuards(ChatGuard)
  @SubscribeMessage('banUser')
  async banUserFromRoom(@MessageBody() data: {
    channelName: string, 
    targetUsername: string }, @ConnectedSocket() client: Socket)
  {
      // Utilise le service roomService pour bannir un utilisateur de la salle
      const result = await this.roomService.banUserfromRoom(data, client);
      if (result.success) {
        // Récupère l'ID Socket de l'utilisateur banni pour lui envoyer une notification
        const bannedUser = await this.usersRepository.findOne({ where: { username: data.targetUsername } });
        const targetSocketId = this.ref_client.get(bannedUser.id);
      const targetSocket = [...this.ref_Socket.keys()].find(Socket => this.ref_Socket.get(Socket) === targetSocketId);
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

   /**
  * Permet à un administrateur de lever le bannissement d'un utilisateur dans une salle de chat.
  * 
  * @param data - Contient le nom de la salle et le nom d'utilisateur de la personne à débannir.
  * @param client - L'objet Socket représentant le client qui émet l'événement.
  * @returns Un objet avec une clé "success" indiquant si l'opération a réussi ou non, ainsi que des messages d'erreur potentiels.
  */

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
      const targetSocket = [...this.ref_Socket.keys()].find(Socket => this.ref_Socket.get(Socket) === targetSocketId);

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

  /**
   * Permet à un administrateur d'expulser un utilisateur d'une salle de chat.
   * 
   * @param data - Contient le nom de la salle et le nom d'utilisateur de la personne à expulser.
   * @param client - L'objet Socket représentant le client qui émet l'événement.
   * @returns Un objet avec une clé "success" indiquant si l'opération a réussi ou non, ainsi que des messages d'erreur potentiels.
   */

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
      const targetSocket = [...this.ref_Socket.keys()].find(Socket => this.ref_Socket.get(Socket) === targetSocketId);
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

   /**
  * Permet à un administrateur de mettre un utilisateur en sourdine dans une salle de chat.
  * 
  * @param data - Contient des informations telles que le nom d'utilisateur de l'administrateur, le nom de la salle, le nom d'utilisateur cible et la durée de mise en sourdine.
  * @param client - L'objet Socket représentant le client qui émet l'événement.
  * @returns Un objet avec une clé "success" indiquant si l'opération a réussi ou non, ainsi que des messages d'erreur potentiels.
  */
  
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

   /**
  * Permet à un administrateur de retirer la sourdine d'un utilisateur dans une salle de chat.
  * 
  * @param data - Contient des informations telles que le nom d'utilisateur de l'administrateur, le nom de la salle et le nom d'utilisateur cible.
  * @param client - L'objet Socket représentant le client qui émet l'événement.
  * @returns Un objet avec une clé "success" indiquant si l'opération a réussi ou non, ainsi que des messages d'erreur potentiels.
  */

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
  
   /**
  * Gère l'envoi de messages dans une salle de chat.
  * 
  * @param client - L'objet Socket représentant le client qui émet le message.
  * @param body - Contient des informations sur le message, y compris le nom de la salle, le nom d'utilisateur de l'expéditeur et le contenu du message.
  * @returns void - Cette fonction n'a pas de valeur de retour explicite.
  */
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
  }
}