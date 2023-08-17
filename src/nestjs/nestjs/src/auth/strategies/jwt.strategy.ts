import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../interface/jwtpayload.interface';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') 
{
    constructor (
      private readonly userService: UserService,
    ){
        super({
            secretOrKey: process.env.ACCESS_TOKEN,
            jwtFromRequest: ExtractJwt.fromExtractors([
              (request: Request) => {
                  const cookieData = JSON.parse(request?.cookies["PongAccessAndRefreshCookie"] || '{}');
                  return cookieData.accessToken;
              }
          ]),
        });
    }

    async validate(payload: JwtPayload): Promise<UserEntity> 
    {
        const user = await this.userService.findUserByUsername(payload.username);
        if (!user) {
            throw new UnauthorizedException();
        }
        console.log("JE SUIS DANS LE GUARD ET JE RETOURNE LE USER : " + user.username);
        return user;
    }
}