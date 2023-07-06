import { AuthGuard } from "@nestjs/passport";
import { UserService } from './user.service'
import { UserEntity } from './user.entity';
import { Controller, Get, Req, Patch, Param, Query, Delete, Res, ForbiddenException } from "@nestjs/common"

@Controller('api/user')
export class UserController {
	constructor (
		private readonly userService: UserService,
	) {}

	/*@UseGuards(AuthGuard('jwt'), UserAuth)
	@Get('/isLogin')
	isLogin(@Req() req: Request): boolean
    {
		const token = req.cookies['jwt'];
		if (!token)
			return false;
		return true;
	}*/
}