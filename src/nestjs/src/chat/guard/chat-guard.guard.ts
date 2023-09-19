import { Injectable, CanActivate } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ChatAuthService } from "../chat-auth.service";
import { UserService } from "src/user/user.service";
import { ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from "../entities/room.entity";
import { RoomService } from "../room.service";
import * as colors from '../../colors'
import { ExecutionContext } from "@nestjs/common";

@Injectable()
export class ChatGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly chatAuthService: ChatAuthService,

    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> 
    {
      const client = context.switchToWs().getClient();
      const accessTokenCookie = client.handshake.query.Cookie;
      console.log("JE SUIS ICI DANS LE GUARD");
      if (!accessTokenCookie) {
          console.log('Access Token Cookie is missing.');
          return false;
      }
    const userData = this.chatAuthService.extractAccessTokenFromCookie(accessTokenCookie);
    if (!userData)
        return false;
    const { username, refreshToken, accessToken } = userData;
    /*JE VERIFIE SI LE TOKEN EST BLACKLISTE*/
    /*if (await this.chatAuthService.isTokenBlacklisted(accessToken)) {
        console.log('Token is blacklisted.');
        return false;
    }*/
    /*JE VERIFIE SI LE EST COMPLET*/
    const decodedPayload = this.chatAuthService.decodeAccessToken(accessToken);
    if (!decodedPayload) {
        console.log('Token is invalid or malformed.');
        return false;
    }
    /*JE VERIFIE SI LE TOKEN EST EXPIRE*/
    if (this.chatAuthService.hasTokenExpired(decodedPayload.exp)) {
        console.log('Token has expired.');
        return false;
    }
    /*JE VERIFIE SI LE TOKEN EST VALIDE AVEC VERIFYASYNC*/
    const payload = await this.chatAuthService.verifyToken(accessToken, process.env.ACCESS_TOKEN);
    if (!payload) {
        return false;
    }
    /*JE TROUVE L'UTILISATEUR ASSOCIE AU TOKEN*/
    const user = await this.userService.findUserByUsername(username);
    if (user)
        console.log("User connected MIDDLEWARE CHATGUARD: ", user.username);
    else
    {
        console.log('User does not exist');
        return false;
    }
    console.log(colors.BRIGHT + colors.BLUE + "Utilisateur est passé par le Guard ChatGuard" + colors.RESET);
    return true;
  }
}

@Injectable()
export class RoomBanGuard implements CanActivate {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    private readonly userService: UserService,
    private readonly chatAuthService: ChatAuthService,
    private readonly roomService: RoomService,

  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> 
  {    // Extraction de l'information du cookie et de la room, adaptée à votre implémentation
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const accessTokenCookie = client.handshake.query.Cookie;

    const roomName = data.channelName;
    //const roomName = context.args[0].handshake.query.roomName;
    console.log("ROOMNAME === ", roomName, " DATA ======== ", data);
    if (!accessTokenCookie || !roomName) {
      console.log('Missing required data.');
      return false;
    }

    const userData = this.chatAuthService.extractAccessTokenFromCookie(accessTokenCookie);
    if (!userData) return false;

    const { username } = userData;

    // Trouver l'utilisateur et la room
    const user = await this.userService.findUserByUsername(username);
    const room = await this.roomService.getRoomByName(roomName);
    if (!user) {
        console.log('User does not exist.');
        return false;
    }
    if (!room) {
      console.log('Room does not exist.');
      return false;
    }

    if (room.bannedIds.includes(user.id)) {
      console.log('User is banned from this room.');
      return false;
    }

    return true;
  }
}