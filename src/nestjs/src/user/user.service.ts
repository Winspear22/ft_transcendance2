import {
  ForbiddenException,
  Injectable,
  NotFoundException, HttpException, HttpStatus, Res, UploadedFile
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { In, Repository } from 'typeorm';
import { authenticator } from 'otplib';
import { Response } from 'express';
import * as colors from '../colors';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UpdateEmailDto, UpdateUserDto } from './dto/updateuser.dto';
import { ImageDto } from './dto/profile_picture.dto';
import * as path from 'path'; // Assurez-vous que le module 'path' est importé
import { RoomEntity } from 'src/chat/entities/room.entity';

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

const UPLOADS_PATH = path.resolve(__dirname, '../../vuejs/uploads');


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    @InjectRepository(RoomEntity)
    private roomRepository: Repository<RoomEntity>
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
      blockedIds: [],
      friends: [],
      friendRequests: []
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
      return verif;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async Deactivate2FA(username: string) {
    const user = await this.usersRepository.findOneBy({ username });
  
    if (user && user.isTwoFactorAuthenticationEnabled) 
    {
      await this.usersRepository.update(user.id, {
        isTwoFactorAuthenticationEnabled: false,
        twoFactorAuthenticationSecret: null,
      });
      var partialUser = await this.returnPartialUserInfo(user.username);
      return { message: '2FA disabled', partialUser };
    } else {
      return { message: '2FA not disabled', partialUser };
    }
  }

  /*=====================================================================*/

  /*=====================================================================*/
  /*-----------------------------USER FINDERS----------------------------*/
  /*=====================================================================*/

  async findUserById(id: number): Promise<UserEntity> {
    return await this.usersRepository.findOneBy({ id });
  }

  async findUserByUsername(username: string): Promise<UserEntity> {
    return await this.usersRepository.findOneBy({ username });
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    return await this.usersRepository.findOneBy({ email });
  }

  async findUserBy42Id(id42: number): Promise<UserEntity> {
    return await this.usersRepository.findOneBy({ id42 });
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
      this.CreateNewAccessCookie(
        {
          username: (await User).username,
          accessToken: tokens.access_token,
          refreshToken: hashedRefreshToken,
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
      return res.redirect(process.env.IP_FRONTEND);
    }
  }


  async CreateCookiesForNewGuest(res: Response, username: string)
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
          refreshToken: hashedRefreshToken,
          avatar: (await User).profile_picture
        },
        res,
      );
    }
  }

  async CreateAndSignTokens(id: string, username: string) 
  {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.jwtService.signAsync({ sub: id, username }, { secret: process.env.ACCESS_TOKEN, expiresIn: '365d' }),
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
      domain: 'made-f0cr5s6', // site sur lequel le cookie est fonctionnel et sur lequel il peut etre envoye
      maxAge: 900000000, // periode de vie du cookie en miliseconde, ici 10 jours
      path: '/', // signifie que le cookie sera envoye dans chacune des requetes http sur le site made-f0cr5s6 en d'autres termes on sera authentifie partout
    });
  }

  async CreateNewRefreshTokens(username: string, RefreshTokenInRequest: string) 
  {
    const User = await this.findUserByUsername(username);
    if (User.MyHashedRefreshToken === null || User === undefined)
      throw new ForbiddenException('Error. Forbidden access : no refresh token present in request.');
    if (User === undefined)
      throw new ForbiddenException('Error. Forbidden access : no user present in request.');
      
      const hashedRefreshTokenInRequest = await bcrypt.hash(RefreshTokenInRequest, User.MyHashedRefreshToken);
      const RefreshTokensMatch = await bcrypt.compare(User.MyHashedRefreshToken, hashedRefreshTokenInRequest);
      if (RefreshTokensMatch == true)
    {
      const tokens = await this.CreateAndSignTokens(User.id.toString(), User.username);
      const saltRounds = 12;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, salt);
      this.FindAndUpdateUser((await User).username, { MyHashedRefreshToken: hashedRefreshToken });
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
      return { faEnabled: user.isTwoFactorAuthenticationEnabled, tokens, avatar: user.profile_picture };
    } 
    catch (e: any) 
    {
      throw e;
    }
  }

  async loginWith2fa(user: string, res: Response): Promise<object> {
    try {
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
      console.log('2FA Error ', e);
    }
  }

  async returnPartialUserInfo(username: string): Promise<Partial<UserEntity>>
  {
    const user = await this.findUserByUsername(username);
    if (!user)
      throw new NotFoundException('No user found');
    const { id42, provider, profile_picture, MyHashedRefreshToken, twoFactorAuthenticationSecret, ...partialUser } = user;

    return (partialUser);

  }

  async UpdateUserUsernameSettings(user: UserEntity,
  @Res({passthrough: true}) res: Response,
  newData: UpdateUserDto)
  {
      const { username } = newData;
      const me = await this.findUserById(user.id)
      if (me.username === username)
        return {success: false};
      if (me.user_status === "playing")
        return {success: false};
      const OtherUser = await this.findUserByUsername(username);
      if (OtherUser)
        return {success: false};
      if (username)
      {
        await this.FindAndUpdateUser((await user).username, { username: username });
        user.username = username;
      }
      var userId = user.id.toString();
      const tokens = await this.CreateAndSignTokens(userId, (await user).username);
      const saltRounds = 12;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, salt);
      this.FindAndUpdateUser((await user).username, { MyHashedRefreshToken: hashedRefreshToken });
      this.CreateNewAccessCookie(
      {
        username: (await user).username,
        accessToken: tokens.access_token,
        refreshToken: hashedRefreshToken,
      },
      res,
      );
      return {success: true};
  }

  async UpdateUserEmailSettings(user: UserEntity,
  @Res({passthrough: true}) res: Response,
  newData: UpdateEmailDto): Promise<void>
  {
    try
    {
      const { email } = newData;
      console.log(email);
      if (email)
      {
        await this.FindAndUpdateUser((await user).username, { email: email });
        user.email = email;
      }
    }
    catch (error)
    {
      res.json({message: "Error. Could not change user email"})
    }
  }

  async UploadAndSaveImage(@UploadedFile() file, user: UserEntity): Promise<ImageDto> {
    console.log(file?.filename);
    if (!file?.filename) { 
        throw new ForbiddenException('Error. Only image files are allowed !');
    }
    
    if (user.profile_picture) {
        this.deleteOldImage(user.profile_picture);
    }

    user.profile_picture = file.filename;

    try {
        await this.FindAndUpdateUser(user.username, { profile_picture: user.profile_picture });
    } catch (e) {
        console.log(e);
        throw e;
    }
    
    const image = {
        filename: file.filename,
        path: file.path
    };
    return image;
  }
  
  deleteOldImage(imagePath: string) 
  {
    var fs = require('fs');

    const fullPath = path.resolve(UPLOADS_PATH, imagePath);

    fs.stat(fullPath, function (err, stats) 
    {
        if (err) {
            return console.error(err);
        }
        fs.unlinkSync(fullPath);
    });
  }
}
