/*import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UsersRepository } from './user.repository';
import { PassportModule, PassportStrategy } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
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
  providers: [UserService, JwtStrategy],
  exports: [UserService, JwtStrategy, PassportModule, JwtModule, TypeOrmModule.forFeature([UserEntity, UsersRepository])],

})
export class UserModule {}*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UsersRepository } from './user.repository';
import { PassportModule, PassportStrategy } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { BlacklistedToken } from 'src/chat/entities/blacklisted-token.entity';

// Importez MulterModule
import { MulterModule } from '@nestjs/platform-express';

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
    // Configurez MulterModule pour définir le répertoire de destination des fichiers uploadés
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [UserService, JwtStrategy, PassportModule, JwtModule, TypeOrmModule.forFeature([UserEntity, UsersRepository])],
})
export class UserModule {}
