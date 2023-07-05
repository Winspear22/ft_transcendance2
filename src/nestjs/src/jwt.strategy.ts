import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersRepository } from "./user.repository";
import { JwtPayload } from "./request.interface";
import { UserEntity } from "./user.entity";
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
}