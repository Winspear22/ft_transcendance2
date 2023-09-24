import { Injectable, CanActivate } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { GameAuthService } from "src/game/game-auth.service";
import { UserService } from "src/user/user.service";


@Injectable()
export class GameGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly gameAuthService: GameAuthService,

    ) {}

    async canActivate(context: any): Promise<boolean> 
    {
        const client = context.switchToWs().getClient();
        const accessTokenCookie = client.handshake.query.Cookie;
        console.log("DANS LE GAMEGUARD");
        if (!accessTokenCookie) 
        {
            console.log('Access Token Cookie is missing.');
            return false;
        }
        const userData = this.gameAuthService.extractAccessTokenFromCookie(accessTokenCookie);
        if (!userData)
            return false;
        const { username, refreshToken, accessToken } = userData;
        /*JE VERIFIE SI LE TOKEN EST BLACKLISTE*/
        /*if (await this.gameAuthService.isTokenBlacklisted(accessToken)) {
            console.log('Token is blacklisted.');
            return false;
        }*/
        /*JE VERIFIE SI LE EST COMPLET*/
        const decodedPayload = this.gameAuthService.decodeAccessToken(accessToken);
        if (!decodedPayload) {
            console.log('Token is invalid or malformed.');
            return false;
        }
        /*JE VERIFIE SI LE TOKEN EST EXPIRE*/
        if (this.gameAuthService.hasTokenExpired(decodedPayload.exp)) {
            console.log('Token has expired.');
            return false;
        }
        /*JE VERIFIE SI LE TOKEN EST VALIDE AVEC VERIFYASYNC*/
        const payload = await this.gameAuthService.verifyToken(accessToken, process.env.ACCESS_TOKEN);
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
        return true;
    }

}