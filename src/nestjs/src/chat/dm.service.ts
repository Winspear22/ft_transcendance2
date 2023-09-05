import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { FriendChat } from 'src/user/entities/friendchat.entity';
import { Friend } from 'src/user/entities/friend.entity';
import { FriendMessage } from 'src/user/entities/friendmessage.entity';


@Injectable()
export class DMService 
{
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
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
    console.log(requested.friendRequests);
    //requested.friendRequests.push(requester.id);
    if (requested.friendRequests.includes(requester.id)) {
      return { error: 'Friend request already sent to this user.', success: false };
    }
  
    for (const friend of requester.friends) {
      if (friend.friendId === requested.id) {
        return { error: 'User already in friend list.', success: false };
      }
    }
  
    if (requester.blockedIds.includes(requested.id)) {
      // remove from blockedIds
      await this.usersRepository.update({ username: sender }, { blockedIds: requester.blockedIds.filter((blockedId) => blockedId !== requested.id) });
  
      if (requested.blockedIds.includes(requester.id)) {
        return { error: 'Remove from block list, but user blocked you.', success: false };
      }
  
      await this.usersRepository.update({ username: receiver }, { friendRequests: [...requested.friendRequests, requester.id] });
      return { error: 'Sent and removed from blocked list.', success: true };
    }
  
    if (requested.blockedIds.includes(requester.id)) {
      return { error: 'User blocked you.', success: false };
    }
  
    // Update the friend requests for the requested user
    await this.usersRepository.update({ username: receiver }, { friendRequests: [...requested.friendRequests, requester.id] });
    return { success: true };
  }

  async getFriendRequests(username: string, accessToken: string, refreshToken: string) {
    const user = await this.usersRepository.findOne({ where: { username } });
    
    const friendRequests = [];
    for (const requestId of user.friendRequests) {
      const requestUser = await this.usersRepository.findOne({ where: { id: requestId }, select: ['username'] });
      friendRequests.push(requestUser.username);
    }
    
    return { success: true, friendRequests };
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
    accepter.friends.push(newFriendForAccepter);
  
    // Supprimer la demande d'ami
    accepter.friendRequests = accepter.friendRequests.filter((requesterId) => requesterId !== accepted.id);
  
    // Sauvegarder les changements pour 'accepter'
    await this.usersRepository.save(accepter);
  
    // Créer une nouvelle relation 'Friend' pour 'accepted'
    const newFriendForAccepted = new Friend();
    newFriendForAccepted.friendId = accepter.id;
    newFriendForAccepted.chatId = chat.id;
    accepted.friends.push(newFriendForAccepted);
  
    // Sauvegarder les changements pour 'accepted'
    await this.usersRepository.save(accepted);
  
    // Retourner le succès
    return { success: true };
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

}