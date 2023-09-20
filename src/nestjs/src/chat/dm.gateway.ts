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
  
  // Première phase du Gateway : la phase de connexion.
  // Fait trois choses : 
  // - Vérifie l'authenticité du cookie avec le ChatGuard
  // - Renvoie les DMrooms dans lesquelles se situe l'utilisateur (avec ses amis)
  // - Renvoie tous les amis que l'utilisateurs a
  // Prend comme arguments la Socket du client
  // Renvoie true si tout s'est bien déroulé
  // OK FRONT
  @UseGuards(ChatGuard)
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
    // Renvoie les DMrooms avec tous les messages et les utilisateurs présents à l'intérieur
    this.emitDMs(client);
    // Renvoie tous les Friends que l'utilisateur a.
    this.emitFriends(client);
    console.log(colors.BRIGHT + colors.GREEN, "User : " +  colors.WHITE + user.username + colors .GREEN +" just connected." + colors.RESET);
    // Ajoute les sockets dans deux maps différentes : c'est juste pour m'aider à répertorier les users
    this.emitFriendRequests(client);
    this.ref_client.set(user.id, client.id);
    this.ref_socket.set(client, client.id);

    console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id : " + colors.WHITE + client.id + colors.RESET);
    console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id is in the handleConnection function: " + colors.WHITE + client.id + colors.RESET);
    return true;
  }


  // Phase de deconnexion : a chaque fois qu'un utilisateur va se déconnecter, il va passer par là
  // Sa socket sera déconnectée par client.disconnect()

  handleDisconnect(@ConnectedSocket() client: Socket)
  {
    //La socket de l'utilisateur est déconnecté du serveur 
    client.disconnect();
    //On retire l'id de la socket de la map.
    for (let [socket, id] of this.ref_socket.entries()) {
      if (socket === client) {
          console.log(colors.GREEN, "La Socket " + colors.WHITE + socket.id + colors.GREEN + " a ete supprimee de la mao !")
          this.ref_socket.delete(socket);
          break;
      }
    }
    console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.FG_RED, client.connected, colors.RESET);
  }


  // Phase de renvoi des DMrooms 
  // Comme pour la phase de connexion, on a un guard, c'est toujours le même
  // - Renvoie les DMrooms dans lesquelles se situe l'utilisateur (avec ses amis)
  // Prend comme argument la socket du client
// OK FRONT 
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

  // Phase de renvoi des amis
  // Guard
  // - Renvoie tous les amis que l'utilisateurs a
  // Prend comme argument la socket du client.
// OK FRONT
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
// OK FRONT
  @UseGuards(ChatGuard)
  @SubscribeMessage('emitFriendRequests')
  async emitFriendRequests(@ConnectedSocket() client: Socket) {
    const user = await this.chatService.getUserFromSocket(client);
    if (!user) {
        console.log("User not found");
        return;
    }

    // Récupérez les IDs des utilisateurs qui ont envoyé des demandes d'ami
    const friendRequestUserIds = user.friendRequests;

    if (!friendRequestUserIds || friendRequestUserIds.length === 0) {
        // Aucune demande d'ami n'a été reçue, vous pouvez renvoyer une réponse vide
        return this.server.to(client.id).emit('emitFriendRequests', []);
    }

    // Utilisez une requête JOIN pour obtenir les détails des utilisateurs
    const friendRequestUsers = await this.usersRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.username', 'user.profile_picture'])
        .whereInIds(friendRequestUserIds)
        .getMany();

    // Maintenant, friendRequestUsers contient les détails des utilisateurs qui ont envoyé des demandes d'ami
    console.log("FRIEND REQUESTS : ", friendRequestUsers);

    // Renvoyez ces détails à l'utilisateur
    return this.server.to(client.id).emit('emitFriendRequests', friendRequestUsers);
  }



  


  //--------------------------------------------------------------------------------------//
  //------------------------------------GESTION DES DMS-----------------------------------//
  //--------------------------------------------------------------------------------------//
  
  // On rentre dans la 2e phase de la gestion des DMs et l'une des plus importante : l'envoi de message

  // L'évènement sendDM va se charger de l'envoi des DMs entre les utilisateurs amis.
  // Il prend comme arguments 
  // - Le nom de la DMroom (qui a été créée automatiquement par l'évènement acceptFriendRequest).
  // - Le nom de l'envoyeur du message
  // - Le message en lui même
  // - Le nom du recepteur du message
  // L'envoi se fait via deux server.to.emit configurés pour être envoyés au récepteur et envoyeur et sont enregistrés pour 
  // la prochaine connexion et seront renvoyé par l'évènement emitDM (qu'on a vu plus haut).
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
  
  // On entre dans la troisième partie du Gateway : la gestion de la vie sociale. Il s'agit ici de pouvoir envoyer des 
  // demandes d'amis, les accepter, les refuser, supprimer des amis ou les bloquer (suppression d'ami + empêcher de renvoyer une demande). 
  
  // La première phase consiste à envoyer une demande d'ami, on a comme arguments :
  // - La socket de l'utilisateur
  // - Le username de l'utilisateur qui reçoit la demande.
  // Cette fonction va créer dans la base de données une demande d'ami et cette demande d'ami va pouvoir être acceptée, ou refusée par l'utilisateur

  @UseGuards(ChatGuard)
  @SubscribeMessage('sendFriendRequest')
  async SendFriendRequest(
  @ConnectedSocket() client: Socket,
  @MessageBody() body: { receiverUsername: string }
  ): Promise<void> 
  {

    // On récupère les données de l'utilisateur qui envoie et réceptionne la demande d'ami
    console.log("Je suis dans SENDFRIENDREQUEST");
    const sender = await this.chatService.getUserFromSocket(client);
    const receiver = await this.usersRepository.findOne({ where: { username: body.receiverUsername } });
    if (!sender || !receiver) {
      this.server.to(client.id).emit("sendFriendRequestError", "Personne introuvable");
      return;
    }
    if (receiver.friendRequests && receiver.friendRequests.includes(sender.id)
    || sender.friendRequests && sender.friendRequests.includes(receiver.id)) {
      this.AcceptFriendRequest(client, body);
      console.log("==============Quand j'envoie une demande d'ami a qq'un a qui j'ai deja demande je passe ici============")
      return;
    }
    const receiverSocketId = this.ref_client.get(receiver.id);
    console.log(receiverSocketId);
    console.log(this.ref_client);
    // On crée dans la base de données la demande en ami (avec tous les checks nécéssaires).
    const ret = await this.DMsService.sendFriendRequest(client.data.user.username, body.receiverUsername);
    // Si tout s'est bien passé on emit aux deux sockets qu'une demande d'ami a été envoyée ou réceptionnée (en fonction de qui est l'envoyeur ou le réceptionneur)
    if (receiverSocketId !== undefined && ret.success == true) {
      this.server.to(receiverSocketId).emit("sendFriendRequestSuccess", "Demande d'ami de " + sender.username);
      this.server.to(client.id).emit("sendFriendRequestSuccess", "Votre demande d'ami a été envoyé à " + receiver.username);
      const newFriendRequests = await this.emitFriendRequests(client);
      this.server.to(client.id).emit('emitFriendRequests', newFriendRequests);
    }
    else // S'il y'a eu un soucis (ex : une demande d'ami a déjà été envoyée ou on a été bloqué), un message d'erreur est envoyé à l'envoyeur 
      this.server.to(client.id).emit("sendFriendRequestError", "Vous ne pouvez pas envoyer de demande d'ami à " + receiver.username);
  }

  // On entre dans la seconde phase l'acceptation ou le refus de la demande d'ami.
  // Cette phase est très importante car c'est celle qui permet de créer la DMroom et d'ajouter des amis;
  // Comme pour la fonction sendFriendRequest, elle prend comme arguments :
  // - La socket de l'utilisateur (nous)
  // - Le username de l'utilisateur qui reçoit la demande.
  // Toutefois il ne faut pas s'embrouiller l'esprit et confondre le receiver (nous, la Socket prise en compte dans les arguments celui qui a reçu la demande d'ami), et 
  // le sender (celui qui a envoyé la demande d'ami, qui est une autre Socket).
  // Si tout se passe bien :
  // - On a une dmRoom qui est crée, les deux utilisateurs y sont intégrés
  // - Deux fonctions join (qui sont des fonctions appartenant à la classe Socket) sont faits pour que les sockets rejoignent la DMroom.
  // - Deux évènements joinDM pour serveur.emit aux utilisateurs qu'ils ont rejoint la DMroom.

  @UseGuards(ChatGuard)
  @SubscribeMessage('acceptFriendRequest')
  async AcceptFriendRequest(
  @ConnectedSocket() client: Socket,
  @MessageBody() body: { receiverUsername: string }
  ): Promise<void> 
  {
    // On recherche les utilisateurs
    const sender = await this.chatService.getUserFromSocket(client);
    const receiver = await this.usersRepository.findOne({ where: { username: body.receiverUsername } });

    if (!sender || !receiver) {
      return;
    }
    // on recherche les socketIds des utilisateurs
    const receiverSocketId = this.ref_client.get(receiver.id);
    const senderSocketId = this.ref_client.get(sender.id);

    console.log(receiverSocketId);
    console.log(this.ref_client);
    // on crée le chat
    const chat = await this.DMsService.acceptFriendRequest(client.data.user.username, body.receiverUsername);
    // Si on a récupéré les deux sockets avec succès
    if (receiverSocketId !== undefined || senderSocketId !== undefined) {
      // On envoie les serveur.emit pour prévenir les utilisateurs que la demande a été acceptée avec un message différent
      this.server.to(client.id).emit("acceptFriendRequest", "You have accepted the friend request of " + receiver.username);
      this.server.to(receiverSocketId).emit("acceptFriendRequest", "Your friend request has been accepted by " + sender.username);
      // On récupère la socket entière pour pouvoir join la conversation
      const senderSocket = [...this.ref_socket.keys()].find(socket => this.ref_socket.get(socket) === senderSocketId);
      const receiverSocket = [...this.ref_socket.keys()].find(socket => this.ref_socket.get(socket) === receiverSocketId);
      console.log("senderSocket == ", senderSocket.id);
      console.log("receiverSocket == ", receiverSocket.id);
      console.log("receiverSocketId == ", receiverSocketId);
      console.log("senderSocketId == ", senderSocketId);
      // Si tout a bien été récupéré
      if (chat && senderSocket && receiverSocket) {
        //On join la conversatio
        senderSocket.join(chat.chat.room);
        receiverSocket.join(chat.chat.room);
        //on emit que la conversation a été join
        this.server.to(client.id).emit("acceptFriendRequest", "You have joined the room :", chat.chat.room );
        this.server.to(receiverSocketId).emit("acceptFriendRequest", "You have joined the room :", chat.chat.room);

        //senderSocket.emit("joinDM", "You have joined " + chat.chat.room );
        //receiverSocket.emit("joinDM",  "You have joined " + chat.chat.room );
      }
        // S'il y'a eu un soucis on emit qu'il y'a eu un soucis.
      else
      {
        this.server.to(client.id).emit("acceptFriendRequest", "Error in the friend request acceptation process" );
        this.server.to(receiverSocketId).emit("acceptFriendRequest", "Error in the friend request acceptation process");
      }
    }
    // S'il y'a eu un soucis on emit qu'il y'a eu un soucis.
    else
    { 
      this.server.to(client.id).emit("acceptFriendRequest", "Error in the friend request acceptation process.");
      this.server.to(receiverSocketId).emit("acceptFriendRequest", "Error in the friend request acceptation process.");
    }
  }

  // Même logique que pour l'acceptation, cette fois-ci on refuse et on ne crée pas de DMRoom. Toutefois, l'utilisateur
  // peut renvoyer une demande si sa demande a été refusée.

  @UseGuards(ChatGuard)
  @SubscribeMessage('refuseFriendRequest')
  async RefuseFriendRequest(
  @ConnectedSocket() client: Socket,
  @MessageBody() body: { receiverUsername: string }
  ): Promise<void> 
  {
    const sender = await this.chatService.getUserFromSocket(client);
    const receiver = await this.usersRepository.findOne({ where: { username: body.receiverUsername } });
    console.log("Je suis ici");

    if (!sender || !receiver) {
      return;
    }
    console.log("Je suis ici");
    const receiverSocketId = this.ref_client.get(receiver.id);
    console.log(receiverSocketId);
    console.log(this.ref_client);
    await this.DMsService.declineFriendRequest(client.data.user.username, body.receiverUsername);
    console.log("Je suis ici");
    if (receiverSocketId !== undefined) {
      this.server.to(client.id).emit("refuseFriendRequest", "You have refused the friend request of " + receiver.username);
      this.server.to(receiverSocketId).emit("refuseFriendRequest", "Your friend request has been refused by " + sender.username);
    }
    else
    {
      this.server.to(client.id).emit("refuseFriendRequest", "Error in the friend request refusal process.");
      this.server.to(receiverSocketId).emit("refuseFriendRequest", "Error in the friend request refusal process.");
    }
  }

  // Dans cette fonction, on retire le rang d'ami à quelqu'un. Il n'apparaît plus dans la liste de nos amis et 
  // la conversation que l'on avait avec lui est supprimée (si je me suis pas gourré).
  // Cette fonction, comme les deux précédantes prend :
  // - La socket de l'utilisateur
  // - le nom de l'ami que l'on veut jarter
  // Renvoie des serveur.emit en fonction de ce qu'il s'est passé

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

  // Essayez de trouver la room avec le nom basé sur les IDs de sender et receiver
  const roomName1 = `friendChat(${sender.id},${receiver.id})`;
  const roomName2 = `friendChat(${receiver.id},${sender.id})`;

  let room = await this.friendChatsRepository.findOne({ where: { room: roomName1 } });

  if (!room) {
    room = await this.friendChatsRepository.findOne({ where: { room: roomName2 } });
  }

  if (!room) {
    this.server.to(client.id).emit("removeFriend", "Error in the friend removal process (unfound room).");
    return;
  }

  // Supprimer les messages associés à la salle de chat
  await this.friendMessageRepository.delete({ chatId: room.id });
  
  // Supprimer la salle de chat elle-même
  await this.friendChatsRepository.delete({ id: room.id });

  await this.DMsService.removeFriend(client.data.user.username, body.receiverUsername);

  if (receiverSocketId !== undefined) {
    this.server.to(client.id).emit("removeFriend", "You have unfriended " + receiver.username);
    this.server.to(receiverSocketId).emit("removeFriend", "You have been unfriended by " + sender.username);
  }
  else {
    this.server.to(client.id).emit("removeFriend", "Error in the friend removal process.");
    this.server.to(receiverSocketId).emit("removeFriend", "Error in the friend removal process.");
  }
}

  // Méthode finale de la gestion de la vie sociale : bloquer les amis
  // Méthode plus radicale : on unfriend l'ami et on l'empêche de renvoyer une requête ou de demander une partie
  // Même logique que les méthodes précédentes
  // Prend comme arguments :
  // - La socket de l'utilisateur
  // - Le nom de l'user que l'on veut bloquer
  // Renvoie des serveur.emit selon ce qu'il s'est passé.

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
      // Essayez de trouver la room avec le nom basé sur les IDs de sender et receiver
    const roomName1 = `friendChat(${sender.id},${receiver.id})`;
    const roomName2 = `friendChat(${receiver.id},${sender.id})`;

    let room = await this.friendChatsRepository.findOne({ where: { room: roomName1 } });

    if (!room) {
      room = await this.friendChatsRepository.findOne({ where: { room: roomName2 } });
    }
    if (!room) {
      this.server.to(client.id).emit("blockDM", "Error in the block process (unfound room).");
      return;
    }

    // Supprimer les messages associés à la salle de chat
    await this.friendMessageRepository.delete({ chatId: room.id });
    
    // Supprimer la salle de chat elle-même
    await this.friendChatsRepository.delete({ id: room.id });

    console.log(receiverSocketId);
    console.log(this.ref_client);
    await this.DMsService.blockFriend(sender, receiver);
    if (receiverSocketId !== undefined) {
      this.server.to(client.id).emit("blockDM", "You have blocked and unfriended " + receiver.username);
      this.server.to(receiverSocketId).emit("blockDM", "You have been blocked and unfriended by " + sender.username);
    }
    else
    {
      this.server.to(client.id).emit("blockDM", "Error in the blocking proccess.");
      this.server.to(receiverSocketId).emit("blockDM", "Error in the blocking proccess.");
    }
  }
}