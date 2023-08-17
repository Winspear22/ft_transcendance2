import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { HomeGateway } from './home.gateway';


@Module({imports: [],
    providers: [
      UserService,
      AuthService,
      HomeGateway],
    controllers: [HomeController],
  })
export class HomeModule {}
