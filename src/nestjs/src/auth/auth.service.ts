import { Injectable } from '@nestjs/common';
import { User42Dto } from '../user/user42.dto';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { authenticator } from 'otplib';
import { toDataURL, toFileStream } from 'qrcode';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async validateUser(userData: User42Dto): Promise<UserEntity> {
    return this.userService.validateUser42(userData);
  }

  public async generateTwoFactorAuthenticationSecret(user: UserEntity) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
      secret,
    );

    await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);

    const qrCode = await this.generateQrCodeDataURL(otpauthUrl);
    /*return {
      secret,
      otpauthUrl
    }*/
    return qrCode;
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    // generate the QrCode that will be used to add our application to the google authenticator app.
    return toDataURL(otpAuthUrl);
  }
}
