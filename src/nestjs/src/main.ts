import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/auth.module'
import { NestExpressApplication } from '@nestjs/platform-express';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() 
{
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);
  app.use(cookieParser());
  app.use(passport.initialize());
  app.enableCors({
    origin: true,
    credentials: true
  });
  app.useGlobalPipes(new ValidationPipe());
  console.log(process.env.SECRET_JWT);
  await app.listen(3000);
  console.log('Server is listening on http://localhost:3000');

}
bootstrap();