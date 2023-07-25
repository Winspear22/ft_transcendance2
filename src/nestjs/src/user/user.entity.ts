import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity 
{
/*==========================================================================*/
/*-----------------------------MANDATORY MENTIONS---------------------------*/
/*==========================================================================*/

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

/*==========================================================================*/

/*==========================================================================*/
/*--------------------------IF USER IS FROM 42 API--------------------------*/
/*==========================================================================*/

  @Column({ nullable: true })
  id42: number;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  email: string;

  /*@Column('text', { default: '' })
  login42: string;*/

  @Column('text', { default: 'empty' })
  profile_picture: string;

  @Column({ default: 'Offline' })
  user_status: string;

  /*==========================================================================*/

  /*==========================================================================*/
  /*-------------------------------2FA MENTIONS-------------------------------*/
  /*==========================================================================*/

  /* COMING FROM THE WANAGO TUTORIAL */

  @Column({ nullable: true })
  public twoFactorAuthenticationSecret?: string;

  @Column({ default: false })
  public isTwoFactorAuthenticationEnabled: boolean;
  /*==========================================================================*/

}
