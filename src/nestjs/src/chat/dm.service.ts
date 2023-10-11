import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { FriendChat } from 'src/user/entities/friendchat.entity';
import { Friend } from 'src/user/entities/friend.entity';
import { FriendMessage } from 'src/user/entities/friendmessage.entity';
import { Raw } from 'typeorm';
import * as colors from '../colors';

@Injectable()
export class DMService 
{
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(Friend)
        private friendRepository: Repository<Friend>,
        @InjectRepository(FriendChat)
        private friendChatsRepository: Repository<FriendChat>,
        @InjectRepository(FriendMessage)
        private friendMessagesRepository: Repository<FriendMessage>
    ) {}

  //--------------------------------------------------------------------------------------//
  //----------------------------------GETTERS OF THE CHAT---------------------------------//
  //--------------------------------------------------------------------------------------//

  async getFriendChat(username: string, friendUsername: string): 
  Promise<{ success: boolean, chat?: { room: string, messages: any[] } }> {
    const user = await this.usersRepository.findOne({ where: { username }, relations: ['friends'] }); 
    const friend = await this.usersRepository.findOne({ where: { username: friendUsername }, select: ['id'] });
    const messages = [];
      
    for (const friendEntity of user.friends) {
      if (friendEntity.friendId === friend.id) {
        const chat = await this.friendChatsRepository.findOne({ where: { id: friendEntity.chatId }, relations: ['messages'] });
          
        for (const message of chat.messages) {
          const sender = await this.usersRepository.findOne({ where: { id: message.senderId }, select: ['username', 'profile_picture'] });
          messages.push({
            senderId: message.senderId,
            text: message.text,
            time: message.createdAt,
            username: sender.username,
            avatar: sender.profile_picture
          });
        }
          
        return {
          success: true,
          chat: {
            room: chat.room,
            messages
          }
        };
      }
    }
  }

  async getAllChatRoomsForUser(username: string): Promise<{ success: boolean, chats?: FriendChat[] }> {
    try {
      // Trouver l'utilisateur par son nom d'utilisateur
      const user = await this.usersRepository.findOne({ where: { username } });
      
      // Vérifier si l'utilisateur existe
      if (!user) {
        return { success: false };
      }
      /*TROUVER QUE L'UTILISATEUR*/
      // Trouver toutes les salles de chat où cet utilisateur est présent
      /*const chats = await this.friendChatsRepository
        .createQueryBuilder('friendChat')
        .innerJoinAndSelect('friendChat.users', 'user', 'user.id = :userId', { userId: user.id })
        .getMany();
      */
     /*TROUVER LES 2 UTILISATEURS*/
      const chats = await this.friendChatsRepository
        .createQueryBuilder('friendChat')
        .innerJoinAndSelect('friendChat.users', 'user')
        .getMany();
      
      return {
        success: true,
        chats
      };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  }
      
  async getFriendId(username: string, friendUsername: string): 
  Promise<{ success: boolean, id?: number }> {
    try {
      const user = await this.usersRepository.findOne({ where: { username } });
  
      const friend = await this.usersRepository.findOne({ where: { username: friendUsername }, select: ['id'] });
      return { success: true, id: friend.id };
    } catch (error) {
      console.error('Error in getFriendId:', error);
    }
  }
  //--------------------------------------------------------------------------------------//
  //----------------------------------GESTION VIE SOCIALE---------------------------------//
  //--------------------------------------------------------------------------------------//

  async sendFriendRequest(sender: string, receiver: string) 
  {
    if (sender === receiver) {
      return { error: "You can't send friend request to yourself.", success: false };
    }
  
    const requester = await this.usersRepository.findOne({ where: { username: sender }, relations: ['friends'] });
    const requested = await this.usersRepository.findOne({ where: { username: receiver } });
    console.log("requested = ", requested.friendRequests);
    if (!requested.friendRequests) {
      console.log("Salut je suis la");
      requested.friendRequests = [];
    }
    console.log("requested = ", requested.friendRequests);
    console.log("requester id = ", requester.id)
    //requested.friendRequests.push(requester.id);
    if (requested.friendRequests)
    {
      const alreadyRequested = await this.usersRepository.findOne({
        where: {
            id: requested.id,
            friendRequests: Raw(alias => `${alias} @> ARRAY[${requester.id}]::integer[]`)
        }
    });
    /* Friend request deja envoyee*/
      if (alreadyRequested) {
          console.log(colors.RED + "Error, you already sent a friend request to this user." + colors.RESET);
          return { error: 'Friend request already sent to this user.', success: false };
      }
    }
    /* Le user est deja notre ami*/
    for (const friend of requester.friends) {
      if (friend.friendId === requested.id) {
        console.log(colors.RED + "Error. User already in friend list." + colors.RESET);
        return { error: 'User already in friend list.', success: false };
      }
    }

    /* J'ai bloque l'utilisateur */
    if (requester.blockedIds.includes(requested.id)) {
      // je retire l'utilisateur de ma liste de personnes bloquees
      await this.usersRepository.update({ username: sender }, { blockedIds: requester.blockedIds.filter((blockedId) => blockedId !== requested.id) });
      // je suis bloque par lui
      if (requested.blockedIds.includes(requester.id)) {
        console.log(colors.RED + "Error. The other user blocked you. Though he was removed from your blocked list." + colors.RESET);
        return { error: 'Remove from block list, but user blocked you.', success: false };
      }
      // il ne m'a pas bloque, donc j'envoie la friend request
      await this.usersRepository.update({ username: receiver }, { friendRequests: [...requested.friendRequests, requester.id] });
      console.log(colors.GREEN + "Success. You unblocked user and friend request was sent." + colors.RESET);
      return { error: 'Sent and removed from blocked list.', success: true };
    }
    // je suis bloque par l'utilisateur
    if (requested.blockedIds.includes(requester.id)) {
      console.log(colors.RED + "Error. The other user blocked you." + colors.RESET);
      return { error: 'User blocked you.', success: false };
    }
  
    // Mise a jour de la iste d'ami dans la base de donnees.
    console.log(colors.GREEN + "Success. Friend request sent to the user." + colors.RESET);
    await this.usersRepository.update(requested.id, { friendRequests: [...requested.friendRequests, requester.id] });

    //await this.usersRepository.update({ username: receiver }, { friendRequests: [...requested.friendRequests, requester.id] });
    return { success: true };
  }


  async acceptFriendRequest(accepterUsername: string, acceptedUsername: string) {
    // Récupérer les utilisateurs et leurs relations 'friends'

    const accepter = await this.usersRepository.findOne({ where: { username: accepterUsername }, relations: ['friends'] });
    const accepted = await this.usersRepository.findOne({ where: { username: acceptedUsername }, relations: ['friends'] });
  
    // Générer le nom de la salle de chat
    const roomName = `friendChat(${accepter.id},${accepted.id})`;
  
    // Trouver ou supprimer la 'room' existante
    let room = await this.friendChatsRepository.findOne({ where: { room: roomName } });
  
    if (room !== null) {
      // Supprimer les messages associés à la salle de chat
      await this.friendMessagesRepository.delete({ chatId: room.id });
    
      // Supprimer la salle de chat elle-même
      await this.friendChatsRepository.delete({ id: room.id });
    }
  
    // Créer une nouvelle 'room'
    const chat = await this.friendChatsRepository.save({
      room: roomName,
      users: [accepter, accepted]
    });
  
    // Créer une nouvelle relation 'Friend' pour 'accepter'
    const newFriendForAccepter = new Friend();
    newFriendForAccepter.friendId = accepted.id;
    newFriendForAccepter.chatId = chat.id;
    newFriendForAccepter.userId = accepter.id;
    accepter.friends.push(newFriendForAccepter);
    console.log("Accepted friends list = ", accepter.friends);

    // Supprimer la demande d'ami
    accepter.friendRequests = accepter.friendRequests.filter((requesterId) => requesterId !== accepted.id);
  
    // Sauvegarder les changements pour 'accepter'
    await this.usersRepository.save(accepter);
    await this.friendRepository.save(newFriendForAccepter);
  
    // Créer une nouvelle relation 'Friend' pour 'accepted'
    const newFriendForAccepted = new Friend();
    newFriendForAccepted.friendId = accepter.id;
    newFriendForAccepted.chatId = chat.id;
    newFriendForAccepted.userId = accepted.id;
    accepted.friends.push(newFriendForAccepted);
    console.log("Accepted friends list = ", accepted.friends);
  
    // Sauvegarder les changements pour 'accepted'
    console.log("Je suis ici !");
    await this.usersRepository.save(accepted);
    await this.friendRepository.save(newFriendForAccepted);
  
    // Retourner le succès
    return { success: true, chat: chat };
  }

  async declineFriendRequest(
    declinerUsername: string,
    declinedUsername: string,
  ): Promise<{ success: boolean }> {
  
    // Fetch the decliner and declined users
    const decliner = await this.usersRepository.findOne({ where: { username: declinerUsername }, select: ['id', 'friendRequests'] });
    const declined = await this.usersRepository.findOne({ where: { username: declinedUsername }, select: ['id'] });
  
    if (decliner && declined) {
      // Filter out the declined user from the decliner's friend requests
      decliner.friendRequests = decliner.friendRequests.filter(id => id !== declined.id);
      
      // Save the updated decliner entity
      await this.usersRepository.save(decliner);
      
      return { success: true };
    }

    // If one of the users was not found
    return { success: false };
  }

  async removeFriend(removerUsername: string, removedUsername: string): Promise<{ success: boolean }> {
    
    const remover = await this.usersRepository.findOne({ where: { username: removerUsername }, relations: ['friends'] });
    const removed = await this.usersRepository.findOne({ where: { username: removedUsername }, relations: ['friends'] });

    const friendRelationForRemover = remover.friends.find(friend => friend.friendId === removed.id);
    const friendRelationForRemoved = removed.friends.find(friend => friend.friendId === remover.id);

    if (!friendRelationForRemover || !friendRelationForRemoved) {
        return { success: false };
    }

    await this.friendRepository.remove(friendRelationForRemover);
    await this.friendRepository.remove(friendRelationForRemoved);

    return { success: true };
  }

  async blockFriend(blocker: UserEntity, blocked: UserEntity): Promise<{ success: boolean, error?: string }> {

    // Vérifier si l'utilisateur essaie de se bloquer lui-même
    if (blocker.username == blocked.username) 
      return { success: false, error: "You can't block yourself" };
    // Si l'utilisateur bloqué a envoyé une demande d'ami au bloqueur, retirez-la
    if (blocked.friendRequests && blocked.friendRequests.includes(blocker.id)) {
      blocked.friendRequests = blocked.friendRequests.filter(id => id !== blocker.id);
      await this.usersRepository.save(blocked);
  }

  // Si le bloqueur a envoyé une demande d'ami à l'utilisateur bloqué, retirez-la
  if (blocker.friendRequests && blocker.friendRequests.includes(blocked.id)) {
      blocker.friendRequests = blocker.friendRequests.filter(id => id !== blocked.id);
      await this.usersRepository.save(blocker);
  }

    // Vérifier si les utilisateurs sont amis
    const friendRelations = await this.getFriendId(blocker.username, blocked.username);
    if (friendRelations.success === true)
      // S'ils sont amis, retirez-les de la liste d'amis de l'autre
      this.removeFriend(blocker.username, blocked.username);

    // Si le bloqueur a déjà bloqué l'utilisateur bloqué
    if (blocker.blockedIds && blocker.blockedIds.includes(blocked.id)) 
      return { success: true };

    // Si le bloqueur n'a pas de liste blockedIds, initialisez-le et ajoutez l'ID de l'utilisateur bloqué
    if (!blocker.blockedIds) blocker.blockedIds = [];
      blocker.blockedIds.push(blocked.id);
    await this.usersRepository.save(blocker);


    // Log pour indiquer que l'action a été effectuée avec succès
    console.log(colors.GREEN + "User" + blocked.username + " has been successfully blocked by " + blocker.username + colors.RESET);
    return { success: true };
  }

}