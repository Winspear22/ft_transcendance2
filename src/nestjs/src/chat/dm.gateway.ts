import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from 'socket.io';
import { ChatGuard } from "./guard/chat-guard.guard";
import { InjectRepository } from "@nestjs/typeorm";
import { Friend } from "src/user/entities/friend.entity";
import { Repository } from "typeorm";
import { FriendChat } from "src/user/entities/friendchat.entity";
import { FriendMessage } from "src/user/entities/friendmessage.entity";
import { ChatService } from "./chat.service";
import { UserEntity } from "src/user/user.entity";
import * as colors from '../colors';
import { DMService } from "./dm.service";

import util from 'util';


@WebSocketGateway({cors: true, namespace: 'dms'})
export class DMGateway
{
    constructor(
    private readonly chatService: ChatService,
    @InjectRepository(Friend)
    private friendsRepository: Repository<Friend>,
    @InjectRepository(FriendChat)
    private friendChatsRepository: Repository<FriendChat>,
    @InjectRepository(FriendMessage)
    private friendMessageRepository: Repository<FriendMessage>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private DMsService: DMService

    ) {}

    private ref_client = new Map<number, string>()
    private ref_socket = new Map<Socket, string>()

    @WebSocketServer()
    server: Server;
  
  //--------------------------------------------------------------------------------------//
  //---------------------------------CONNEXION/DECONNEXION--------------------------------//
  //--------------------------------------------------------------------------------------//
  //@UseGuards(ChatGuard)
  @SubscribeMessage('Connection')
  async handleConnection(@ConnectedSocket() client: Socket) 
  {
    console.log("Je suis ici !!");
    const user = await this.chatService.getUserFromSocket(client);
    if (user == undefined)
    {
      console.log(colors.BRIGHT + colors.RED, "Error. Socket id : " + colors.WHITE + client.id + colors.RED + " could not connect." + colors.RESET);
      return this.handleDisconnect(client);
    }
    this.emitDMs(client);
    this.emitFriends(client);
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
  @SubscribeMessage('emitDM')
  async emitDMs(@ConnectedSocket() client: Socket) 
  {
    const user = await this.chatService.getUserFromSocket(client);
    if (!user) {
        console.log("User not found");
        return;
    }
    const friendChats = await this.friendChatsRepository
        .createQueryBuilder('friendChat')
        .innerJoinAndSelect('friendChat.users', 'user', 'user.id = :userId', { userId: user.id }) // Filtre par utilisateur
        .leftJoinAndSelect('friendChat.users', 'allUsers')  // Sélectionne tous les utilisateurs du chat
        .leftJoinAndSelect('friendChat.messages', 'message')
        .getMany();
    console.log("POPOPOPOPOPOPOPOPOPOPOPOPOPOPO", friendChats);
    friendChats.forEach(friendChat => {
        client.join(friendChat.room);
    });
    console.log("Je suis connecté : ", client.rooms);
    return await this.server.to(client.id).emit('emitDM', friendChats);
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('emitFriends')
  async emitFriends(@ConnectedSocket() client: Socket) 
  {
      const user = await this.chatService.getUserFromSocket(client);
      if (!user) {
        console.log("User not found");
        return;
      }
  
      // Obtenir tous les enregistrements d'amis pour cet utilisateur
      const friendEntities = await this.friendsRepository.find({ where: { userId: user.id } });
  
      // Obtenir les détails de chaque ami
      const friendDetails = [];
      for (const friendEntity of friendEntities) {
          const friendDetail = await this.usersRepository.findOne({ 
              where: { id: friendEntity.friendId },
              select: ["id", "username", "user_status", "profile_picture"] 
          });
          if (friendDetail) {
              friendDetails.push(friendDetail);
          }
      }
      console.log("Friend list : ", friendDetails);
      return await this.server.to(client.id).emit('emitFriends', friendDetails);
  }
  


  //--------------------------------------------------------------------------------------//
  //------------------------------------GESTION DES DMS-----------------------------------//
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
  async handleDMs(
  @ConnectedSocket() client: Socket,
  @MessageBody() body: { room: string, senderUsername: string, message: string, receiverUsername: string }
  ): Promise<void> 
  {
    const sender = await this.chatService.getUserFromSocket(client);
    const receiver = await this.usersRepository.findOne({ where: { username: body.receiverUsername } });
    // Je verifie l'existence de l'un ou l'autre des utilisateur 
    if (!sender || !receiver) {
      return;
    }
    // Je verifie si le receiver n'a pas bloque le sender 
    if (receiver.blockedIds && receiver.blockedIds.includes(sender.id)) {
      return;
    }
    // Je verifie si le sender n'a pas bloque le receiver 
    if (sender.blockedIds && sender.blockedIds.includes(receiver.id)) {
      return;
    }
    // Je verifi que le message n'est pas vide
    if (body.message.length === 0) {
      return;
    }
    // Je verifie que les deux sont bien amis, car lorsque deux utilisateurs deviennent amis, une room portant leur nom est creee
    let chat = await this.friendChatsRepository.findOne({
      where: { room: body.room },
      relations: ['users']
    });
    if (!chat)
    {
      this.server.to(client.id).emit("sendDM", "Your are not friend with " + receiver.username);
      return ;
    }
    // Je cree mon entite mssage avec toutes les infos : pour quelle room (1), qui l'envoie (2), le contenu (3) et je l'enregistre 
    const newMessage = new FriendMessage();
    newMessage.chat = chat;
    newMessage.senderId = sender.id;
    newMessage.text = body.message;
    const savedMessage = await this.friendMessageRepository.save(newMessage);
    const receiverSocketId = this.ref_client.get(receiver.id);

    if (receiverSocketId !== undefined) {
      this.server.to(receiverSocketId).emit("sendDM", savedMessage);
      this.server.to(client.id).emit("sendDM", savedMessage);
    }
    else
      return ;
  }

  //--------------------------------------------------------------------------------------//
  //----------------------------------GESTION VIE SOCIALE---------------------------------//
  //--------------------------------------------------------------------------------------//
  
  @UseGuards(ChatGuard)
  @SubscribeMessage('sendFriendRequest')
  async SendFriendRequest(
  @ConnectedSocket() client: Socket,
  @MessageBody() body: { receiverUsername: string }
  ): Promise<void> 
  {
    const sender = await this.chatService.getUserFromSocket(client);
    const receiver = await this.usersRepository.findOne({ where: { username: body.receiverUsername } });
    if (!sender || !receiver) {
      return;
    }
    const receiverSocketId = this.ref_client.get(receiver.id);
    console.log(receiverSocketId);
    console.log(this.ref_client);
    const ret = await this.DMsService.sendFriendRequest(client.data.user.username, body.receiverUsername);
    if (receiverSocketId !== undefined && ret.success == true) {
      this.server.to(receiverSocketId).emit("sendFriendRequestSuccess", "Friend request from " + sender.username);
      this.server.to(client.id).emit("sendFriendRequestSuccess", "Your friend request has been sent to " + receiver.username);
    }
    else
      this.server.to(client.id).emit("sendFriendRequestError", "Error. Could not send friend request to " + receiver.username);
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('acceptFriendRequest')
  async AcceptFriendRequest(
  @ConnectedSocket() client: Socket,
  @MessageBody() body: { receiverUsername: string }
  ): Promise<void> 
  {
    const sender = await this.chatService.getUserFromSocket(client);
    const receiver = await this.usersRepository.findOne({ where: { username: body.receiverUsername } });

    if (!sender || !receiver) {
      return;
    }
    const receiverSocketId = this.ref_client.get(receiver.id);
    const senderSocketId = this.ref_client.get(sender.id);

    console.log(receiverSocketId);
    console.log(this.ref_client);
    const chat = await this.DMsService.acceptFriendRequest(client.data.user.username, body.receiverUsername);
    if (receiverSocketId !== undefined || senderSocketId !== undefined) {
      this.server.to(client.id).emit("acceptFriendRequest", "You have accepted the friend request of " + receiver.username);
      this.server.to(receiverSocketId).emit("acceptFriendRequest", "Your friend request has been accepted by " + sender.username);
      const senderSocket = [...this.ref_socket.keys()].find(socket => this.ref_socket.get(socket) === senderSocketId);
      const receiverSocket = [...this.ref_socket.keys()].find(socket => this.ref_socket.get(socket) === receiverSocketId);
      console.log("senderSocket == ", senderSocket.id);
      console.log("receiverSocket == ", receiverSocket.id);
      console.log("receiverSocketId == ", receiverSocketId);
      console.log("senderSocketId == ", senderSocketId);

      if (chat && senderSocket && receiverSocket) {
        senderSocket.join(chat.chat.room);
        receiverSocket.join(chat.chat.room);
        senderSocket.emit("joinDM", "You have joined " + chat.chat.room );
        receiverSocket.emit("joinDM",  "You have joined " + chat.chat.room );
      }
    }
    else
      return ;
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('refuseFriendRequest')
  async RefuseFriendRequest(
  @ConnectedSocket() client: Socket,
  @MessageBody() body: { receiverUsername: string }
  ): Promise<void> 
  {
    const sender = await this.chatService.getUserFromSocket(client);
    const receiver = await this.usersRepository.findOne({ where: { username: body.receiverUsername } });

    if (!sender || !receiver) {
      return;
    }
    const receiverSocketId = this.ref_client.get(receiver.id);
    console.log(receiverSocketId);
    console.log(this.ref_client);
    await this.DMsService.declineFriendRequest(client.data.user.username, body.receiverUsername);
    if (receiverSocketId !== undefined) {
      this.server.to(client.id).emit("refuseFriendRequest", "You have refused the friend request of " + receiver.username);
      this.server.to(receiverSocketId).emit("refuseFriendRequest", "Your friend request has been refused by " + sender.username);
    }
    else
      return;
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('removeFriend')
  async RemoveFriend(
  @ConnectedSocket() client: Socket,
  @MessageBody() body: { receiverUsername: string }
  ): Promise<void> 
  {
    const sender = await this.chatService.getUserFromSocket(client);
    const receiver = await this.usersRepository.findOne({ where: { username: body.receiverUsername } });

    if (!sender || !receiver) {
      return;
    }
    const receiverSocketId = this.ref_client.get(receiver.id);
    console.log(receiverSocketId);
    console.log(this.ref_client);
    await this.DMsService.removeFriend(client.data.user.username, body.receiverUsername);
    if (receiverSocketId !== undefined) {
      this.server.to(client.id).emit("removeFriend", "You have unfriended " + receiver.username);
      this.server.to(receiverSocketId).emit("removeFriend", "You have been unfriended by " + sender.username);
    }
    else
      return;
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('blockDM')
  async BlockFriend(
  @ConnectedSocket() client: Socket,
  @MessageBody() body: { receiverUsername: string }
  ): Promise<void> 
  {
    const sender = await this.chatService.getUserFromSocket(client);
    const receiver = await this.usersRepository.findOne({ where: { username: body.receiverUsername } });

    if (!sender || !receiver) {
      return;
    }
    const receiverSocketId = this.ref_client.get(receiver.id);
    console.log(receiverSocketId);
    console.log(this.ref_client);
    await this.DMsService.blockFriend(sender, receiver);
    if (receiverSocketId !== undefined) {
      this.server.to(client.id).emit("blockDM", "You have blocked and unfriended " + receiver.username);
      this.server.to(receiverSocketId).emit("blockDM", "You have been blocked and unfriended by " + sender.username);
    }
    else
      return;
  }
}