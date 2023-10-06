import { 
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import * as colors from '../colors';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { RoomService } from './room.service';
import { RoomEntity } from './entities/room.entity';
import { Body, UseGuards } from '@nestjs/common';
import { ChatGuard } from './guard/chat-guard.guard';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomBanGuard } from './guard/chat-guard.guard';
import { UserEntity } from 'src/user/user.entity';
import { MessageEntity } from './entities/message.entity';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';

@WebSocketGateway({cors: true, namespace: 'chats'})
export class ChatGateway 
{
  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
    private readonly usersService: UserService,
    @InjectRepository(RoomEntity)
    private roomRepository: Repository<RoomEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(MessageEntity)
    private messagesRepository: Repository<MessageEntity>,

    
    ) {}
  
  // Map pour stocker les références entre l'ID utilisateur et l'ID de Socket
  private ref_client = new Map<number, string>()

  // Map pour stocker les références entre l'objet Socket et l'ID de Socket
  private ref_Socket = new Map<Socket, string>()

  private ref_socket_userid = new Map<Socket, number>()
  

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
    console.log("-------------------------------------------------");
    console.log("---------------CONNEXION AU CHAT-----------------");
    console.log("-------------------------------------------------");
    console.log(colors.BRIGHT + colors.YELLOW + "Je suis l'utilisateur " + colors.WHITE + user.username + colors.YELLOW + " avec la socket.id : " + colors.WHITE + client.id);
    
    this.ref_client.set(user.id, client.id);
    this.ref_Socket.set(client, client.id);
    this.ref_socket_userid.set(client, user.id);
    this.emitRooms(client);
    this.emitAvailableRooms(client);
    this.emitRoomInvitation(client);
    //console.log(colors.BRIGHT + colors.YELLOW, "Utilisateur : " +  colors.WHITE + user.username + colors .YELLOW +" vient de se connecter." + colors.RESET);
    return true;
  }

  handleDisconnect(client: Socket) {
    client.disconnect();

    // Suppression de ref_Socket
    for (let [Socket, id] of this.ref_Socket.entries()) {
      if (Socket === client) {
          console.log(colors.YELLOW, "La Socket " + colors.WHITE + Socket.id + colors.YELLOW + " a été supprimée de la map ref_Socket !");
          this.ref_Socket.delete(Socket);
          break;
      }
    }

    // Suppression de ref_socket_userid
    const userId = this.ref_socket_userid.get(client);
    if (userId !== undefined) {
        console.log(colors.YELLOW, "La Socket " + colors.WHITE + client.id + colors.YELLOW + " a été supprimée de la map ref_socket_userid !");
        this.ref_socket_userid.delete(client);
    }

    // Suppression de ref_client
    if (userId) {
        const clientId = this.ref_client.get(userId);
        if (clientId && clientId === client.id) {
            console.log(colors.YELLOW, "La Socket " + colors.WHITE + client.id + colors.YELLOW + " a été supprimée de la map ref_client !");
            this.ref_client.delete(userId);
        }
    }
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
    console.log("Émission des rooms pour le client : ", client.id);
    return await this.server.to(client.id).emit('emitRooms', rooms);
  }

  @UseGuards(ChatGuard)
  //@SubscribeMessage('getAvailableRoomsForAllUsers')
  @SubscribeMessage('emitAvailableRooms')
  async emitAvailableRooms(@ConnectedSocket() client: Socket) {
      const allUsers = await this.usersRepository.find();
      for (const user of allUsers) {
        const userSocket = [...this.ref_socket_userid.entries()]
            .find(([socket, userId]) => userId === user.id)?.[0];
        if (userSocket) {
          const availableRooms = await this.roomService.getRooms(userSocket);
          this.server.to(userSocket.id).emit('emitAvailableRooms', availableRooms);
          console.log("JE SUIS DANS EMIT AVAILABLE ROOM ", userSocket.id); 
        }
      }
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('emitRoomInvitation')
  async emitRoomInvitation(@ConnectedSocket() client: Socket) {
      const user = await this.chatService.getUserFromSocket(client);
  
      if (!user) {
          console.log("Utilisateur non trouvé");
          return;
      }
  
      // Récupération de tous les rooms où l'utilisateur est dans la liste pendingIds
      const invitedRooms = await this.roomRepository
          .createQueryBuilder('room')
          .where(':userId = ANY(room.pendingIds)', { userId: user.id })
          .getMany();
  
      // Envoi des rooms invitées à l'utilisateur
      console.log(colors.RED + "-------------------------------------------------" + colors.RESET);
      console.log("Émission des invitations de rooms pour le client : ", client.id, invitedRooms);
      return await this.server.to(client.id).emit('emitRoomInvitation', invitedRooms);
  }

  private getSocketByString(value: string): Socket | undefined {
    for (let [socket, str] of this.ref_Socket.entries()) {
        if (str === value) {
            return socket;
        }
    }
    return undefined;  // Si aucune correspondance n'est trouvée
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('emitUsersInRoom')
  async getUsersInRoom(@MessageBody() data: { channelName: string }): Promise<any[]> {
    // Obtenez les sockets des clients dans la salle
    const socketsInRoom = await this.server.in(data.channelName).fetchSockets();
  
    // Récupérez le champ `.user` de chaque socket (plutôt que `.data`)
    const usersData = socketsInRoom.map(socket => socket.data.user);
  
    //console.log("Avant filtrage:", usersData);
  
    // Filtrer les doublons basés sur l'ID de l'utilisateur
    const seenIds = {}; // objet pour suivre les ID déjà vus
    const uniqueUsersData = usersData.filter(user => {
      if (!user || !user.id) {
      //  console.warn("Socket sans user ou user.id:", user);
        return false;
      }
    
      if (seenIds[user.id]) {
      //  console.log(`ID déjà vu: ${user.id} (${user.username})`);
        return false; // Si l'ID a déjà été vu, ne pas inclure l'utilisateur
      }
    
      seenIds[user.id] = true; // Marquer l'ID comme vu
      return true; // Inclure l'utilisateur
    });
  
    console.log("Après filtrage:", uniqueUsersData);
  
    // Émettez cet événement à tous les clients de cette salle avec le tableau uniqueUsersData
    this.server.to(data.channelName).emit('usersDataInRoom', uniqueUsersData);
  
    // Retournez également le tableau uniqueUsersData
    return uniqueUsersData;
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
        this.emitAvailableRooms(client);
        this.emitRooms(client);
        this.emitRoomInvitation(client);

      } else {
        this.server.emit('createRoom', "Error. Channel " + data.channelName + " was not created.");
      }
      return result;
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('changeRoomPassword')
  async changeRoomPassword(@MessageBody() data: {
    channelName: string,
    password?: string
  }, @ConnectedSocket() client: Socket) 
  {
    const { channelName, password } = data;
    const user = client.data.user;
    const userId = user.id;

    // Récupérer la salle avec le nom fourni
    const room = this.roomService.getRoomByName(channelName)

    // S'assurer que la salle existe
    if (!room) {
        return { success: false, error: 'Channel does not exist' };
  
    }

    // Vérifier si l'utilisateur est le propriétaire de la salle
    if ((await room).owner === userId) 
    {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        (await room).password = hashedPassword; // Stockez le mot de passe hashé, pas le mot de passe en clair    
      }
      else
        (await room).password = null; // Si aucun mot de passe n'est fourni, le mot de passe actuel sera supprimé
      await this.roomRepository.save((await room));
      this.server.to(client.id).emit('changeRoomPassword', "The password of the room " + channelName + " was modified.");
      this.server.in(channelName).emit('changeRoomPassword', "The password of the room " + channelName + " was modified.");
      this.emitAvailableRooms(client);
      this.emitRooms(client);
      this.emitRoomInvitation(client);

      return ;
    }  else {
        this.server.to(client.id).emit('changeRoomPassword', "Error. Password of the room " + channelName + " not modified.");
        return ;
    }
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
      const usersInRoom = await this.roomService.GetSocketsInRoom(data, this.ref_client, this.ref_Socket);
      const result = await this.roomService.quitRoom(data, client);
      
      // Notifications sur le succès de l'opération
      if (result.success) 
      {
        this.server.to(client.id).emit('quitRoom', "You have left the room " + data.channelName);
        this.server.to(data.channelName).emit('quitRoom', client.data.user.username + " has left the room " + data.channelName);
        client.leave(data.channelName);
        this.emitAvailableRooms(client);
        const room = await this.roomService.getRoomByName(data.channelName);
        if (room == undefined)
          usersInRoom.forEach(socket => { this.emitRooms(socket) });
        else
          this.emitRooms(client);
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
        this.emitAvailableRooms(client);
        this.emitRooms(client);
        this.emitRoomInvitation(client);

        return (result);
      }
      else
      {
        // En cas d'erreur lors de la tentative de rejoindre
        this.server.to(client.id).emit('joinRoom', "Error, there was a problem in joining the room : " + data.channelName);
        return (result);
      }
  }

  @UseGuards(ChatGuard, RoomBanGuard)
  @SubscribeMessage('inviteRoom')
  async inviteRoom(@MessageBody() data: { channelName: string, invitedUsernames: string }, @ConnectedSocket() client: Socket) {
    const inviter = client.data.user;

    // Recherche de la salle par son nom
    const room = await this.roomService.getRoomByName(data.channelName);

    if (!room) {
        this.server.to(client.id).emit("inviteRoom", "Error, room does not exist.");
        return ;
    }

    if (!room.isPrivate) {
        this.server.to(client.id).emit("inviteRoom", "Error, room is not private.");
        return ;
    }

    // Vérifiez si l'utilisateur est le propriétaire ou un administrateur de la salle
    if (room.owner !== inviter.id && !room.admins.includes(inviter.id)) {

        this.server.to(client.id).emit("inviteRoom", "Error, you do not have the permission to invite people.");
        return ;
    }
    console.log("**********************************************************************1");
    // Trouvez les utilisateurs invités par leur nom d'utilisateur
    const invitedUser = await this.usersService.findUserByUsername(data.invitedUsernames);
    console.log("**********************************************************************2");

    if (!invitedUser){

      this.server.to(client.id).emit("inviteRoom", "Error, the user doesn't exist.");
      return ;
  }


    // Vérifiez si l'utilisateur est déjà dans la room
    if (room.users.includes(invitedUser.id)) {

        this.server.to(client.id).emit("inviteRoom", "Error, the user is already in the room.");
        return ;
    }

    // Vérifiez si une invitation a déjà été envoyée à l'utilisateur
    if (room.pendingIds.includes(invitedUser.id)) 
    {
        this.server.to(client.id).emit("inviteRoom", "Error, an invitation has already been sent to the user.");
        return ;
    }

    // Ajoutez les IDs des utilisateurs invités à la liste pendingIds de la salle
    room.pendingIds.push(invitedUser.id);

    await this.roomRepository.save(room);
    const invitedSocket = this.roomService.getSocketFromUserId(invitedUser.id, this.ref_client, this.ref_Socket);

    // Envoie une notification aux utilisateurs invités
    if (invitedSocket) {
        this.server.to(invitedSocket.id).emit('inviteRoom', "You have been invited by " + inviter.username + " to join the private room " + room.roomName);
        this.server.to(client.id).emit('inviteRoom', "Invitation sent to " + invitedUser.username + " to join private room " + room.roomName);
      }

    return { success: true, message: 'Invitations sent successfully' };
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('cancelRoomInvitation')
  async cancelRoomInvitation(@MessageBody() data: { channelName: string, invitedUsernames: string }, @ConnectedSocket() client: Socket) 
  {
    const inviter = client.data.user;

    // Recherche de la salle par son nom
    const room = await this.roomService.getRoomByName(data.channelName);

    if (!room) {
        return this.server.to(client.id).emit("cancelRoomInvitation", "Error, room does not exist.");
    }

    // Vérifiez si l'utilisateur est le propriétaire ou un administrateur de la salle
    if (room.owner !== inviter.id && !room.admins.includes(inviter.id)) {
        return this.server.to(client.id).emit("cancelRoomInvitation", "Error, you do not have the permission to cancel the invitation.");
    }

    // Trouvez les utilisateurs invités par leur nom d'utilisateur
    const invitedUser = await this.usersService.findUserByUsername(data.invitedUsernames);

    // Vérifiez si une invitation a été envoyée à l'utilisateur
    if (!room.pendingIds.includes(invitedUser.id)) {
        return this.server.to(client.id).emit("cancelRoomInvitation", "Error, there's no pending invitation for this user.");
    }

    // Supprimez les IDs des utilisateurs invités de la liste pendingIds de la salle
    room.pendingIds = room.pendingIds.filter(id => id !== invitedUser.id);

    await this.roomRepository.save(room);

    // Envoie une notification aux utilisateurs invités
    const socketId = this.ref_client.get(invitedUser.id);
    if (socketId) {
        this.server.to(socketId).emit('cancelRoomInvitation', { channelName: room.roomName, inviter: inviter.username });
    }

    return { success: true, message: 'Invitation cancelled successfully' };
}



  // Pour accepter l'invitation
  @UseGuards(ChatGuard)
  @SubscribeMessage('acceptRoomInvitation')
  async acceptRoomInvitation(@MessageBody() data: { channelName: string, password?: string, inviterUsername: string }, @ConnectedSocket() client: Socket) {
      const user = client.data.user;
      const inviter = await this.usersService.findUserByUsername(data.inviterUsername);
      const room = await this.roomService.getRoomByName(data.channelName);

      if (!room) {
        this.server.to(client.id).emit("acceptRoomInvitation", "Error, room does not exist.");
        return ;
      }

      if (!room.pendingIds.includes(user.id)) {
          this.server.to(client.id).emit("acceptRoomInvitation", "Error, no pending invitation for this room.");
          return ;
      }

      // Supprimer l'utilisateur de la liste pendingIds et l'ajouter à la liste users
      room.pendingIds = room.pendingIds.filter(id => id !== user.id);
      const inviterSocket = this.roomService.getSocketFromUserId(inviter.id, this.ref_client, this.ref_Socket);

      room.users.push(user.id);
      
      await this.roomRepository.save(room);
      client.join(data.channelName);


      this.server.to(inviterSocket.id).emit("acceptRoomInvitation", `Your invitation to join the room ${room.roomName} has been accepted by ${user.username}.`);
      this.server.to(client.id).emit("acceptRoomInvitation", `You have joined the room ${room.roomName} successfully.`);
      this.emitAvailableRooms(client);
      this.emitRooms(client);
      this.emitRoomInvitation(client);
      return true;
  }

  // Pour refuser l'invitation
  @UseGuards(ChatGuard)
  @SubscribeMessage('declineRoomInvitation')
  async declineRoomInvitation(@MessageBody() data: { channelName: string, inviterUsernqme: string }, @ConnectedSocket() client: Socket) {
      const user = client.data.user;
      const inviter = await this.usersService.findUserByUsername(data.inviterUsernqme);
      const room = await this.roomService.getRoomByName(data.channelName);

      if (!room) {
          return this.server.to(client.id).emit("declineRoomInvitation", "Error, room does not exist.");
      }

      if (!room.pendingIds.includes(user.id)) {
          return this.server.to(client.id).emit("declineRoomInvitation", "Error, no pending invitation for this room.");
      }

      // Supprimer l'utilisateur de la liste pendingIds
      room.pendingIds = room.pendingIds.filter(id => id !== user.id);

      await this.roomRepository.save(room);
      const inviterSocketId = this.ref_client.get(inviter.id);
      const inviterSocket = [...this.ref_Socket.keys()].find(socket => this.ref_Socket.get(socket) === inviterSocketId);
      this.emitRoomInvitation(client);
      this.server.to(inviterSocket.id).emit("declineRoomInvitation", `${user.username} chose not to join your room.`);
      return this.server.to(client.id).emit("declineRoomInvitation", `You have declined the invitation for room ${room.roomName}.`);
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
            message: `Vous êtes banni de la room ${data.channelName} par un admin.`,
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
            message: `Vous êtes débanni de la room ${data.channelName} par un admin.`,
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
    console.log("SEND MESSAGE", body.channelName, body.senderUsername, body.message)
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
    console.log("Traitement du message du client :", client.id);

    // Émettez le message aux clients
    this.server.to(savedMessage.room.roomName).emit('sendMessage', savedMessage, { senderUsername: sender.username, senderpp: sender.profile_picture});
  }
}