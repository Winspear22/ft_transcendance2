import {
  ForbiddenException,
  Injectable,
  NotFoundException, HttpException, HttpStatus
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { authenticator } from 'otplib';
import { Response } from 'express';
import { Request } from 'express';
import * as colors from '../colors';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  avatar: string;

  @IsOptional()
  type: string
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async createUser(userDet: any): Promise<UserEntity> {
    const newUser = this.usersRepository.create({
      username: userDet.login,
      email: userDet.email,
      profile_picture: userDet.picture,
      isTwoFactorAuthenticationEnabled: false,
      user_status: 'Online',
      id42: userDet.providerId,
      provider: userDet.provider,
    });
    console.log(colors.YELLOW + colors.BRIGHT, "==============================================", colors.RESET);
    console.log(colors.GREEN + colors.BRIGHT, "------------------USER CREATED---------------", colors.RESET);
    console.log(colors.YELLOW + colors.BRIGHT, "==============================================", colors.RESET);
    this.DisplayUserIdentity(newUser);
    await this.usersRepository.save(newUser);
    //On ecrit l'id apres le save car c'est la fonction save qui attribut l'id.
    console.log(colors.GREEN + colors.BRIGHT, 'My User simple ID === ', colors.WHITE + colors.BRIGHT + newUser.id);
    console.log(colors.YELLOW + colors.BRIGHT, "==============================================", colors.RESET);
    return newUser;
  }
  /*=====================================================================*/
  /*-----------------------------2FA METHODES----------------------------*/
  /*=====================================================================*/

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    return this.usersRepository.update(userId, {
      twoFactorAuthenticationSecret: secret,
    });
  }

  async turnOnTwoFactorAuthentication(username: string) 
  {
    return this.FindAndUpdateUser(username, { isTwoFactorAuthenticationEnabled: true });
  }

  async isTwoFactorAuthenticationCodeValid(TfaCode: string, username: string) {
    try {
      const user = await this.findUserByUsername(username);
      const verif = authenticator.check(
        TfaCode,
        user.twoFactorAuthenticationSecret,
      );
      console.log(verif);
      return verif;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async Deactivate2FA(username: string) {
    const user = await this.usersRepository.findOneBy({ username });
  
    if (user && user.isTwoFactorAuthenticationEnabled) {
      await this.usersRepository.update(user.id, {
        isTwoFactorAuthenticationEnabled: false,
        twoFactorAuthenticationSecret: null,
      });
      return { message: '2FA disabled' };
    } else {
      return { message: '2FA not disabled' };
    }
  }

  /*=====================================================================*/

  /*=====================================================================*/
  /*-----------------------------USER FINDERS----------------------------*/
  /*=====================================================================*/

  async findUserById(id: number): Promise<UserEntity> {
    return this.usersRepository.findOneBy({ id });
  }

  async findUserByUsername(username: string): Promise<UserEntity> {
    return this.usersRepository.findOneBy({ username });
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    return this.usersRepository.findOneBy({ email });
  }

  /*=====================================================================*/
  /*-----------------------------USER GETTERS----------------------------*/
  /*=====================================================================*/

  async getUserStatusByUsername(username: string): Promise<string | undefined> {
    const user = await this.findUserByUsername(username);
    if (user) {
      return user.user_status;
    }
    return undefined;
  }
  /*=====================================================================*/

  /*=====================================================================*/
  /*----------------------------USER UPDATER-----------------------------*/
  /*=====================================================================*/

  async FindAndUpdateUser(
    username: string,
    updateData: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.update(user.id, updateData);
    return await this.usersRepository.findOneBy({ username });
  }
  /*=====================================================================*/

  /*=====================================================================*/
  /*----------------------------USER DELETER-----------------------------*/
  /*=====================================================================*/
    async deleteUserByUsername(username: string): Promise<void> {
      await this.usersRepository.delete({ username });
    }

    async deleteUserById(id: number): Promise<void> {
      await this.usersRepository.delete({ id });
    }
    async deleteUserByEmail(email: string): Promise<void> {
      await this.usersRepository.delete({ email });
    }

    async deleteAllUsers(): Promise<void> {
      await this.usersRepository.clear();
    }
  
  /*=====================================================================*/

  /*=====================================================================*/
  /*-------------------------COOKIES CREATION METHOD---------------------*/
  /*=====================================================================*/

  async CreateCookiesForNewUser(res: Response, username: string)
  {
    const User = this.findUserByUsername(username);
    if ((await User).isTwoFactorAuthenticationEnabled === false)
    {
      const idAsString: string = (await User).id.toString();
      const tokens = await this.CreateAndSignTokens(idAsString, (await User).username);

      const saltRounds = 12;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, salt);
      this.FindAndUpdateUser((await User).username, { MyHashedRefreshToken: hashedRefreshToken });
      console.log(colors.GREEN + colors.BRIGHT + "User hashed refresh token : " + colors.FG_WHITE + hashedRefreshToken + colors.RESET);
      this.CreateNewAccessCookie(
        {
          username: (await User).username,
          accessToken: tokens.access_token,
          refreshToken: hashedRefreshToken,//tokens.refresh_token,
          avatar: (await User).profile_picture
        },
        res,
      );
      console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);
      console.log(colors.GREEN + colors.BRIGHT, "----------------NORMAL REDIRECTD--------------", colors.RESET);
      console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);

      return res.redirect(process.env.IP_FRONTEND);
    }
    else
    {
      console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);
      console.log(colors.GREEN + colors.BRIGHT, "------------------2FA REDIRECTD---------------", colors.RESET);
      console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);
      //const message = "auth ok";
      //res.status(200).json(message);
      return res.redirect(process.env.IP_FRONTEND);
     
      //const url = `http://localhost:8080/tfa`;
      //res.redirect(url);
    }
  }

  async CreateAndSignTokens(id: string, username: string) 
  {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.jwtService.signAsync({ sub: id, username }, { secret: process.env.ACCESS_TOKEN,expiresIn: 60 * 15 * 20 }),
      this.jwtService.signAsync({ sub: id, username }, { secret: process.env.REFRESH_TOKEN, expiresIn: 60 * 60 * 24 * 7})]);
    return {access_token: new_access_token, refresh_token: new_refresh_token};
  }

  async CreateNewAccessCookie(data: object, res: Response) 
  {
    const serializeData = JSON.stringify(data);
    res.clearCookie('PongAccessAndRefreshCookie', { path: '/' });
    res.cookie('PongAccessAndRefreshCookie', serializeData, {
      sameSite: 'lax', // est une mesure de securite de type lax
      httpOnly: false, // gere l'accessibilite du cookie par le naviguateur et javascript, true : inaccessible / false : accessible
      secure: false, // doit etre mis sur false, sinon on ne peut pas envoyer sur des adresses http, que https
      domain: 'localhost', // site sur lequel le cookie est fonctionnel et sur lequel il peut etre envoye
      maxAge: 900000000, // periode de vie du cookie en miliseconde, ici 10 jours
      path: '/', // signifie que le cookie sera envoye dans chacune des requetes http sur le site localhost en d'autres termes on sera authentifie partout
    });
  }

  async CreateNewRefreshTokens(username: string, RefreshTokenInRequest: string) 
  {
    const User = await this.findUserByUsername(username);
    if (User.MyHashedRefreshToken === null || User === undefined)
      throw new ForbiddenException('Error. Forbidden access : no refresh token present in request.');
    if (User === undefined)
      throw new ForbiddenException('Error. Forbidden access : no user present in request.');
      
      //const RefreshTokenVerify = await bcrypt.compare(User.MyHashedRefreshToken, RefreshTokenInRequest);
      const hashedRefreshTokenInRequest = await bcrypt.hash(RefreshTokenInRequest, User.MyHashedRefreshToken);
      const RefreshTokensMatch = await bcrypt.compare(User.MyHashedRefreshToken, hashedRefreshTokenInRequest);
      if (RefreshTokensMatch == true)
    {
      const tokens = await this.CreateAndSignTokens(User.id.toString(), User.username);
      const saltRounds = 12; // Nombre de cryptage de password
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, salt);
      this.FindAndUpdateUser((await User).username, { MyHashedRefreshToken: hashedRefreshToken });
      console.log(colors.CYAN + colors.BRIGHT,"Selected user new refresh token : " + colors.GREEN + User.MyHashedRefreshToken + colors.RESET);

      return tokens;
    }
    else
      throw new ForbiddenException('Error. Refresh tokens mismatch.');
  }
  /*=====================================================================*/

  async DisplayUserIdentity(user: UserEntity)
  {
    console.log(colors.RED + colors.BRIGHT + "========================" + colors.RESET)
    console.log(colors.CYAN + colors.BRIGHT + "------USER IDENTITY-----" + colors.RESET)
    console.log(colors.RED + colors.BRIGHT + "========================" + colors.RESET)
    console.log(colors.BLUE + colors.BRIGHT,"Selected user id : " + colors.WHITE + user.id + colors.RESET);
    console.log(colors.BLUE + colors.BRIGHT,"Selected user username : " + colors.WHITE + user.username + colors.RESET);
    console.log(colors.BLUE + colors.BRIGHT,"Selected user email : " + colors.WHITE + user.email + colors.RESET);
    console.log(colors.BLUE + colors.BRIGHT,"Selected user profile picture : " + colors.WHITE + user.profile_picture + colors.RESET);
    console.log(colors.BLUE + colors.BRIGHT,"Selected user 2FA option : " + colors.WHITE + user.isTwoFactorAuthenticationEnabled + colors.RESET);
    if (await this.getUserStatusByUsername(user.username) == "Online")
      console.log(colors.BLUE + colors.BRIGHT,"Selected user connection status : " + colors.GREEN + user.user_status + colors.RESET);
    else
      console.log(colors.BLUE + colors.BRIGHT,"Selected user connection status : " + colors.RED + user.user_status + colors.RESET);

    console.log(colors.BLUE + colors.BRIGHT,"Selected user 42 ID : " + colors.WHITE + user.id42 + colors.RESET);
  }

  /*======================================================================*/

  async signin(dto: AuthDto, res: Response): Promise<object> {
    try {
      const user = await this.findUserByUsername(dto.nickname)
      if (!user) {
        throw new HttpException('No user found', HttpStatus.FORBIDDEN);
      }
      if (user.profile_picture !== dto.avatar && dto.avatar !== '') {
        //await this.userRepository.save(user);
        await this.usersRepository.save(user);
      }

      const tokens = await this.CreateAndSignTokens(user.id.toString(), user.username);//this.signTokens(user.user_id, user.login);
      await this.CreateNewRefreshTokens(user.username, user.MyHashedRefreshToken);
      this.CreateNewAccessCookie(
        {
          nickname: user.username,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
        res,
      ); 
      // Send the response as JSON with status 200
      console.log("JE SUIS iciiiiiiii");

      return { faEnabled: user.isTwoFactorAuthenticationEnabled, tokens, avatar: user.profile_picture };
    } catch (e: any) {
      throw e;
    }
  }

  async loginWith2fa(user: string, res: Response): Promise<object> {
    try {
      console.log("JE SUIS LAAAAAAAAAAAA");
      const usr = await this.findUserByUsername(user);
      return this.signin(
        {
          nickname: usr.username,
          password: usr.MyHashedRefreshToken,
          avatar: usr.profile_picture,
          type: 'tfa',
        },
        res,
      );
    } catch (e) {
      console.log('TFA EROOOOR ', e);
    }
  }
}
