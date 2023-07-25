/*import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersRepository } from "src/user/user.repository";
import { JwtPayload } from '../interface/request.interface';
import { UserEntity } from '../../user/user.entity';
import { Request } from "express"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor (
        @InjectRepository(UsersRepository)
        private usersRepository: UsersRepository,
    ){
        super({
            secretOrKey: "superSecret2021",//process.env.SECRET_JWT,
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    let accessToken = request?.cookies["jwt"];
                    return accessToken;
                }
            ]),
        });
    }

    async validate(payload: JwtPayload): Promise<UserEntity> {
        const {username} = payload;
        const user: UserEntity = await this.usersRepository.findOne({where: {username} });

        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}*/

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import TokenPayload from '../auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor',
) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        },
      ]),
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.findUserById(payload.userId);
    if (!user.isTwoFactorAuthenticationEnabled) {
      return user;
    }
    if (payload.isSecondFactorAuthenticated) {
      return user;
    }
  }
}
