import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service'; // Assurez-vous que le chemin d'accès est correct
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interface/jwtpayload.interface';
import { decode, TokenExpiredError } from 'jsonwebtoken';  // Ne pas oublier d'importer les méthodes nécessaires

@Injectable()
export class ChatService {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

    extractAccessTokenFromCookie(cookie: string): any {
        try
        {
            const decodedCookie = decodeURIComponent(cookie); 
            return JSON.parse(decodedCookie);
        }
        catch (error)
        {
            console.log("Error. Cookie could not be decoded.");
            return (undefined);
        }
        //const decodedCookie = decodeURIComponent(cookie); 
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        return await this.userService.isTokenBlacklisted(token);
    }

    decodeAccessToken(token: string): JwtPayload | null {
        const decodedPayload = decode(token) as JwtPayload;
        return decodedPayload || null;
    }

    hasTokenExpired(expiry: number): boolean {
        const currentTime = Math.floor(Date.now() / 1000);
        return expiry < currentTime;
    }

    async verifyToken(accessToken: string, secret: string): Promise<JwtPayload | null> {
        try {
            return await this.jwtService.verifyAsync(accessToken, { secret });
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                console.log('Token has expired.');
            } else {
                console.log('Token is invalid:', error.message);
            }
            return null;
        }
    }
}
