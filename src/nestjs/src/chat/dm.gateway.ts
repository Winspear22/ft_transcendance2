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

    ) {}

    private ref_client = new Map<number, string>()

    @WebSocketServer()
    server: Server;
    
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