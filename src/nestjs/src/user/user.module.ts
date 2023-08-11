/*import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UsersRepository } from './user.repository';
import { PassportModule, PassportStrategy } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtTwoFactorStrategy } from 'src/auth/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UsersRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'superSecret2021',
      signOptions: {
        expiresIn: 86400,
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtTwoFactorStrategy],
  exports: [JwtTwoFactorStrategy, PassportModule, UserService, JwtModule],
})
export class UserModule {}
*/

// user.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UsersRepository } from './user.repository';
import { PassportModule, PassportStrategy } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtTwoFactorStrategy } from 'src/auth/strategies/jwt.strategy';
import { BlacklistedToken } from 'src/chat/entities/blacklisted-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UsersRepository, BlacklistedToken]),  // Ajoutez BlacklistedTokenEntity ici
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'superSecret2021',
      signOptions: {
        expiresIn: 86400,
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtTwoFactorStrategy],
  exports: [JwtTwoFactorStrategy, PassportModule, UserService, JwtModule],
})
export class UserModule {}
