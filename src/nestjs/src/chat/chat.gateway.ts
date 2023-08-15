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
import { RoomEntity } from './entities/room.entity';
import { UseGuards } from '@nestjs/common';
import { ChatGuard } from './guard/chat-guard.guard';


@WebSocketGateway({cors: true, namespace: 'chats'})
export class ChatGateway 
{
  constructor(private userService: UserService,
    private readonly chatService: ChatService,
    private readonly chatAuthService: ChatAuthService,
    private readonly roomService: RoomService
    ) {}
  
  private ref_client = new Map<string, number>()



  @WebSocketServer()
  server: Server;
  
  @SubscribeMessage('message')
  handleMessage(@MessageBody() msg: string)
  {
    console.log("Message venant de la socket : ", msg);
    this.server.emit('message', msg);
  }

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
  }

  handleDisconnect(client: Socket)
  {
    client.disconnect();
    console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.FG_RED, client.connected, colors.RESET);
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('newMessage')
  async handleNewMessage(@MessageBody() data: CreateMessageDto, @ConnectedSocket() client: Socket) {
    console.log("data = ", data);
    const newMessage = await this.chatService.createMessage(data);
    
    console.log("Message = ", newMessage);
    this.server.emit('newMessage', newMessage);
    return { status: 'Message sent and saved' };
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('getAllMessages')
  async GetAllMessages() 
  {
    const messages = await this.chatService.getAllMessages();
    this.server.emit('getAllMessages', messages);
    return await this.chatService.getAllMessages();
  }
  
  /**
  * Permet de creer une room
  */
  @UseGuards(ChatGuard)
  @SubscribeMessage('createRoom')
  async handleCreateRoom(@MessageBody() data: { name: string },
  @ConnectedSocket() client: Socket): Promise<RoomEntity | undefined> 
  {
    const roomName = await this.roomService.getRoomByName(data.name);
    //console.log(roomName);
    if (roomName == undefined)
    {
      const room = await this.roomService.createRoom(data.name, [client.data.user]);
      console.log(colors.BRIGHT + colors.BLUE + "L'utilisateur : ", colors.WHITE, client.data.user.username, colors.BLUE, " fait parti des rooms AVANT JOIN", colors.WHITE, client.rooms);
      client.join(room.name);
      console.log(colors.BRIGHT + colors.BLUE + "L'utilisateur : ", colors.WHITE, client.data.user.username, colors.BLUE, " fait parti des rooms APRES JOIN", colors.WHITE, client.rooms);
      console.log(colors.BRIGHT + colors.BLUE + "La room : ", colors.WHITE, data.name, colors.BLUE, " a ete creee avec succes." + colors.RESET);
      room.roomCreator = client.data.user;
      room.roomCurrentAdmin = client.data.user;
      await this.roomService.addUserToRoom(room.id, client.data.user);
      const message = "La room " + room.name + " a ete creee avec succes !";
      this.chatService.setUserAdminStatusON(client, room.id);
      this.chatService.setUserCreatorStatusON(client, room.id);
      this.server.emit("RoomCreationSuccess", message);
      return room;
    }
    else
    {
      console.log(colors.BRIGHT + colors.BLUE + "La room : ", colors.WHITE, data.name, colors.BLUE, " n'a pas pu etre creee car elle existe deja." + colors.RESET)
      const message = "La room " + roomName.name + " existe deja, par consequent elle n'a pas ete creee";
      this.server.emit("RoomCreationError", message);
      return roomName;
    } 
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('deleteRoom')
  async handleDeleteRoom(@MessageBody() data: { roomId: number }, 
  @ConnectedSocket() client: Socket): Promise<void> 
  {
    const room = await this.roomService.getRoomById(data.roomId);
    if (room)
    {
      /*NE PAS OUBLIER DE RAJOUTER LE IF Y'A QU'UN SEUL UTILISATEUR*/
      client.leave(room.name);
      await this.roomService.deleteUserFromRoom(data.roomId, client.data.user);
      this.chatService.setUserAdminStatusOFF(client, room.id);
      this.chatService.setUserCreatorStatusOFF(client, room.id);
      await this.roomService.deleteRoom(data.roomId);
      const message = "La room " + room.name + " a ete supprimee avec succes !";
      console.log(message);
      this.server.emit("RoomDeletionSuccess", message);
    }
    else
    {
      const message = "La room n'existe pas.";
      console.log(message);
      this.server.emit("RoomDeletionError", message);
    }
}


  /* NE FONCTIONNE PAS DU TOUT */
  @UseGuards(ChatGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@MessageBody() data: { roomId: number },
  @ConnectedSocket() client: Socket): Promise<void> 
  {
      console.log(colors.BRIGHT + colors.GREEN + "JE SUIS DANS JOIN ROOM" + colors.RESET);
    const room = await this.roomService.getRoomById(data.roomId); // Supposant que vous avez une méthode getRoomById
    if (room) {
        console.log("J'AI TROUVE LA ROOM, il sagit de : ", room.id, room.name, room.members);
        console.log(colors.BRIGHT + colors.BLUE + "L'utilisateur : ", colors.WHITE, client.data.user.username, colors.BLUE, " fait parti des rooms AVANT JOIN", colors.WHITE, client.rooms);
        client.join(room.name);
        await this.roomService.addUserToRoom(room.id, client.data.user);
        this.server.to(room.name).emit('userJoinedRoom', { roomId: data.roomId, username: client.data.user.username });
        console.log(colors.BRIGHT + colors.BLUE + "L'utilisateur : ", colors.WHITE, client.data.user.username, colors.BLUE, " fait parti des rooms APRES JOIN ", colors.WHITE, client.rooms);
      }
  }

  



  @UseGuards(ChatGuard)
  @SubscribeMessage('newMessageInRoom')
  async handleNewMessageRoom(@MessageBody() data: CreateMessageDto, @ConnectedSocket() client: Socket): Promise<void> {
    const newMessage = await this.chatService.createMessage(data);
    //console.log(data);
    //this.server.to(data.room.name).emit('newMessageInRoom', newMessage); // Émet le message à une salle spécifique
  }
  @UseGuards(ChatGuard)
  @SubscribeMessage('who')
  async whoisinroom(@MessageBody() data: { roomId: number }, @ConnectedSocket() client: Socket) 
  {
    const room = await this.roomService.getAllMembersFromRoom(data.roomId);
    console.log(room);
  }


  @UseGuards(ChatGuard)
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(@MessageBody() data: { roomId: number }, @ConnectedSocket() client: Socket): Promise<void> {
    const room = await this.roomService.getRoomById(data.roomId);
      console.log(colors.BRIGHT + colors.GREEN + "JE SUIS DANS LEAVE ROOM" + colors.RESET);
      console.log(colors.BRIGHT + colors.GREEN + "L'utilisateur : ", colors.WHITE, client.data.user.username, colors.GREEN, " fait parti des rooms AVANT leave ", colors.WHITE, client.rooms);
    if (room) {
        console.log("J'AI TROUVE LA ROOM, il sagit de : ", room.id, room.name, room.members);
        client.leave(room.name);
        await this.roomService.deleteUserFromRoom(room.id, client.data.user);
        this.server.to(room.name).emit('userLeftRoom', { roomId: data.roomId, username: client.data.user.username });
        console.log(colors.BRIGHT + colors.GREEN + "L'utilisateur : ", colors.WHITE, client.data.user.username, colors.GREEN, " fait parti des rooms APRES leave ", colors.WHITE, client.rooms);
    }
  }
}