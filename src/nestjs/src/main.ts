import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
//import { AuthModule } from './auth.module';
import { AuthModule } from './auth/auth.module'
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session'
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';


async function bootstrap() 
{
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);

  app.enableCors({
    origin: true,
    credentials: true
  });
    app.use(cookieParser());
  console.log(process.env.SECRET_JWT);

  await app.listen(3000);
}
bootstrap();
