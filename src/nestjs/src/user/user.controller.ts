import { UserService } from './user.service'
import { UserEntity } from './user.entity';
import { Controller, Req,
	Res,
	Post,
	Body,
	HttpStatus,
	HttpCode,
	UploadedFile,
	UseInterceptors,
	Get,
	Param
	 } from "@nestjs/common"
import { UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { JwtAuthGuard } from "src/auth/guard/jwt-guard.guard";
import { UpdateEmailDto, UpdateUserDto } from "./dto/updateuser.dto";
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageDto } from './dto/profile_picture.dto';
import path = require("path")
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import { Observable, of } from "rxjs";
/* MANIERE POUR FAIRE AVEC LE DOSSIER UPLOADS*/

/*type validMimeType =  'image/png' | 'image/jpg' | 'image/jpeg' | 'image/gif'

const validMimeTypes: validMimeType [] = [
	'image/png',
	'image/jpg',
	'image/jpeg',
	'image/gif'
]

export const storage = {
	storage: diskStorage({
		destination: './uploads/',
		filename: (req, file, cb) => {
			const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
			const extension: string = path.parse(file.originalname).ext;
			cb(null, `${filename}${extension}`)
		}
	}),
	fileFilter: (req, file, cb) => {
		const allowedMimeTypes: validMimeType[] =  validMimeTypes;
		allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
	},
	limits: {
		fileSize: 1000000
    }
}*/
/* MANIERE POUR FAIRE AVEC LES CONTENEURS*/
type validMimeType =  'image/png' | 'image/jpg' | 'image/jpeg' | 'image/gif'

const validMimeTypes: validMimeType [] = [
	'image/png',
	'image/jpg',
	'image/jpeg',
	'image/gif'
]

const UPLOADS_PATH = path.resolve(__dirname, '../../vuejs/uploads');

export const storage = {
	storage: diskStorage({
        destination: UPLOADS_PATH,
		filename: (req, file, cb) => {
			const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
			const extension: string = path.parse(file.originalname).ext;
			cb(null, `${filename}${extension}`)
		}
	}),
	fileFilter: (req, file, cb) => {
		const allowedMimeTypes: validMimeType[] =  validMimeTypes;
		allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
	},
	limits: {
		fileSize: 1000000
    }
}




@Controller('user')
export class UserController {
	constructor (
		private readonly userService: UserService,
	) {}

	@Post('change/username')
	@UseGuards(JwtAuthGuard)
	//@HttpCode(HttpStatus.CREATED)
	async ChangeUsername(@Body() data: UpdateUserDto,
	@Req() req: Request, @Res({passthrough: true}) res: Response)
	{
		const user = req.user as UserEntity;
		const result = await this.userService.UpdateUserUsernameSettings(user, res, data);
    if (result.success == true)
    {
		const partialUser = await this.userService.returnPartialUserInfo(user.username);
		return res.status(201).json({ message: 'Username successfully modified to ' + partialUser.username, partialUser });
    }
    else
      return res.status(409).json({message: "Error. Could not change user's username"});
	}

	@Post('change/email')
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.CREATED)
	async ChangeEmail(@Body() data: UpdateEmailDto,
	@Req() req: Request, @Res({passthrough: true}) res: Response)
	{
		try
		{
			const user = req.user as UserEntity;
			await this.userService.UpdateUserEmailSettings(user, res, data);
			const partialUser = await this.userService.returnPartialUserInfo(user.username);
			res.status(201).json({ message: 'Email successfully modified.', partialUser });
		}
		catch
		{
			return ;
		}
	}

	@Post('change/pp')
	@UseInterceptors(FileInterceptor('file', storage))
	@HttpCode(HttpStatus.CREATED)
	@UseGuards(JwtAuthGuard)	
	async ChangeProfilePicture(@UploadedFile() file,
	@Req() req: Request): Promise<ImageDto> 
	{
		console.log(file);
		const user = req.user as UserEntity;
		return this.userService.UploadAndSaveImage(file, user);
	}
	/*MANIERE POUR FAIRE AVEC LE DOSSIER UPLOADS*/

	/*@UseGuards(JwtAuthGuard)	
	@Get('change/getpp/:profilePicture')
	getProfilePicture(@Res() res,
	@Param('profilePicture') profilePicture: string): Promise<Observable<object>> {
		return this.userService.getImage(res, profilePicture);
	}*/
}
