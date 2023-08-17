import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class UpdateUserDto 
{
    @IsString()
    @Length(2, 10)
    @Matches(/^[a-zA-Z0-9-_]+$/, {
        message: 'Username should only contain letters, numbers, dashes and underscores.',
    })
    username: string;
}

export class UpdateEmailDto {
    @IsEmail()
    email: string;
}