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
    this.emitDMs(client);
    console.log(colors.BRIGHT + colors.GREEN, "User : " +  colors.WHITE + user.username + colors .GREEN +" just connected." + colors.RESET);
    
    this.ref_client.set(user.id, client.id);
    console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id : " + colors.WHITE + client.id + colors.RESET);
    console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id is in the handleConnection function: " + colors.WHITE + client.id + colors.RESET);

  }

  handleDisconnect(client: Socket)
  {
    client.disconnect();
    console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.FG_RED, client.connected, colors.RESET);
  }

  /*@UseGuards(ChatGuard)
  @SubscribeMessage('emitDM')
  async emitDMs(@ConnectedSocket() client: Socket) {
    const DMs = await this.DMsService.getAllChatRoomsForUser(client.data.user.username);
    console.log(DMs);
    return await this.server.to(client.id).emit('emitDM', DMs); // Pas sur, il faut que ca puisse envoyer a tout le monde.
  }*/

  @UseGuards(ChatGuard)
  @SubscribeMessage('emitDM')
  async emitDMs(@ConnectedSocket() client: Socket) {
    const user = await this.chatService.getUserFromSocket(client);
    if (!user) {
      console.log("User not found");
      return;
    }

  // Récupérer tous les FriendChats de cet utilisateur
    const friendChats = await this.friendChatsRepository
      .createQueryBuilder('friendChat')
      .innerJoinAndSelect('friendChat.users', 'user', 'user.id = :userId', { userId: user.id })
      .getMany();

  // Joindre ces FriendChats
    console.log(friendChats);
    friendChats.forEach(friendChat => {
      client.join(friendChat.room);
    });
    console.log("Je suis connecte : ", client.rooms); // Affiche quelque chose comme Set { <socket.id>, 'room1', 'room2', ... }
  // Envoyer les FriendChats à l'utilisateur
    const DMs = await this.DMsService.getAllChatRoomsForUser(user.username);
    console.log(DMs);
    return await this.server.to(client.id).emit('emitDM', DMs);
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
  
  /*@UseGuards(ChatGuard)
  @SubscribeMessage('sendDM')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { room: string, senderUsername: string, message: string, receiverUsername: string }
  ): Promise<void> 
  {
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

    let chat = await this.friendChatsRepository.findOne({
      where: { room: body.room }
    });
    if (!chat) 
    {
      chat = new FriendChat();
      chat.room = body.room;
      chat = await this.friendChatsRepository.save(chat);
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
  }*/

@UseGuards(ChatGuard)
@SubscribeMessage('sendDM')
async handleMessage(
@ConnectedSocket() client: Socket,
@MessageBody() body: { room: string, senderUsername: string, message: string, receiverUsername: string }
): Promise<void> 
{
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

  let chat = await this.friendChatsRepository.findOne({
    where: { room: body.room },
    relations: ['users']
  });

  if (!chat) 
  {
    console.log("Je suis ici !!!1");
    chat = new FriendChat();
    chat.room = body.room;
    chat.users = [sender, receiver];
    chat = await this.friendChatsRepository.save(chat);
    console.log("Je suis ici !!!2");
  }
  console.log("Je suis ici !!!3");


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