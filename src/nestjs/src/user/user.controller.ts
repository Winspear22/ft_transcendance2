import { UserService } from './user.service'
import { UserEntity } from './user.entity';
import { Controller, Req,
	Res,
	Post,
	Body,
	HttpStatus,
	HttpCode,
	UploadedFile,
	UseInterceptors
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

type validMimeType =  'image/png' | 'image/jpg' | 'image/jpeg' | 'image/gif'

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
}




@Controller('user')
export class UserController {
	constructor (
		private readonly userService: UserService,
	) {}

	@Post('change/username')
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.CREATED)
	async ChangeUsername(@Body() data: UpdateUserDto,
	@Req() req: Request, @Res({passthrough: true}) res: Response)
	{
		try
		{
			const user = req.user as UserEntity;
			await this.userService.UpdateUserUsernameSettings(user, res, data);
			const partialUser = await this.userService.returnPartialUserInfo(user.username);
			res.status(201).json({ message: 'Username successfully modified to ' + partialUser.username, partialUser });
		}
		catch
		{
			return ;
		}

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
	//@UseInterceptors(FileInterceptor('file'))
	@HttpCode(HttpStatus.CREATED)
	@UseGuards(JwtAuthGuard)	
	async ChangeProfilePicture(@UploadedFile() file,
	@Req() req: Request): Promise<ImageDto> 
	{
		console.log(file);
		const user = req.user as UserEntity;
		return this.userService.UploadAndSaveImage(file, user);
	}
}