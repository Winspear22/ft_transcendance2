import { Injectable } from '@nestjs/common';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { authenticator } from 'otplib';
import { toDataURL, toFileStream } from 'qrcode';
import { JwtService } from '@nestjs/jwt';
import * as colors from '../colors'

export interface TokenPayload {
  userId: number;
  isSecondFactorAuthenticated?: boolean;
}

export default TokenPayload;

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    ) {}

  public async generateTwoFactorAuthenticationSecret(user: UserEntity) {
    const secret = authenticator.generateSecret();
    console.log("secret == ", secret);
    const otpauthUrl = authenticator.keyuri(
      user.email,
      process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
      secret,
    );

    await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);

    const qrCode = await this.generateQrCodeDataURL(otpauthUrl);
    return {
      secret,
      qrCode
    };
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    // generate the QrCode that will be used to add our application to the google authenticator app.
    return toDataURL(otpAuthUrl);
  }

  public getCookieWithJwtAccessToken(userId: number, isSecondFactorAuthenticated = false) {
    const payload: TokenPayload = { userId, isSecondFactorAuthenticated };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,//this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME//`${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
    });
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}`;
  }

  async WriteCommandsNames(name: string)
  {
    console.log(colors.GREEN + colors.BRIGHT, '---' + name + '---', colors.BRIGHT);  
  }

}
