import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserEntity } from 'src/user/user.entity';
import * as colors from '../colors'
import { ChatAuthService } from './chat-auth.service';
//import { UserService } from 'src/user/user.service';
import { RoomEntity } from './entities/room.entity';
import { Friend } from 'src/user/entities/friend.entity';

@Injectable()
export class ChatService {

  constructor(
      @InjectRepository(RoomEntity)
      private roomRepository: Repository<RoomEntity>,
      @InjectRepository(UserEntity)
      private usersRepository: Repository<UserEntity>,
      @InjectRepository(Friend)
      private friendsRepository: Repository<Friend>,
      private chatAuthService: ChatAuthService,
      //private userService: UserService,
  ) {}
  
  async findUserByUsername(username: string): Promise<UserEntity> 
  {
    return await this.usersRepository.findOneBy({ username });
  }

  async findUserById(id: number): Promise<UserEntity> 
  {
      return await this.usersRepository.findOneBy({ id });
  }

  async getUserFromSocket(@ConnectedSocket() client: Socket): Promise<UserEntity | undefined>
  {
      let accessTokenCookie = client.handshake.query.Cookie;
      console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.GREEN, client.connected, colors.RESET);
      if (!accessTokenCookie) 
      {
          console.log('Access Token Cookie is missing!!!');
          return undefined;
      }
  
      if (Array.isArray(accessTokenCookie)) {
          accessTokenCookie = accessTokenCookie[0];
      }
      const userData = this.chatAuthService.extractAccessTokenFromCookie(accessTokenCookie);
      if (!userData)
        return undefined;
      const { accessToken } = userData;
      const decodedPayload = this.chatAuthService.decodeAccessToken(accessToken);
      if (!decodedPayload) 
      {
        console.log('Token is invalid or malformed.');
        return undefined;
      }
      if (this.chatAuthService.hasTokenExpired(decodedPayload.exp)) 
      {
        console.log('Token has expired.');
        return undefined;
      }
      const payload = await this.chatAuthService.verifyToken(accessToken, process.env.ACCESS_TOKEN);
      if (!payload) 
        return undefined;
      const user = await this.findUserById(parseInt(decodedPayload.sub));
      client.data.user = user;
      if (user)
        return (user);
      else
        return undefined;
  }
    
  async areUsersFriends(userId1: number, userId2: number): Promise<boolean> 
  {
    const friendship1 = await this.friendsRepository.findOne({ where: { userId: userId1, friendId: userId2 } });
    const friendship2 = await this.friendsRepository.findOne({ where: { userId: userId2, friendId: userId1 } });
    return !!(friendship1 || friendship2);
  }
  

  async getAllFriendsOfUser(userId: number): Promise<Friend[]> 
  {
      return this.friendsRepository.find({ where: [{ userId }, { friendId: userId }] });
  }

  async isUserBlocked(user: UserEntity, blockedUserId: number): Promise<boolean> 
  {
    const foundUser = await this.usersRepository.findOne({ where: { id: user.id }});
    if (foundUser && foundUser.blockedIds && foundUser.blockedIds.includes(blockedUserId)) {
        return true;
    }
    return false;
  }
}
