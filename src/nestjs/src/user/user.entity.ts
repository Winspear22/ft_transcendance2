import { 
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany
  } from 'typeorm';
import { RoomEntity } from 'src/chat/entities/room.entity';

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
/*--------------------------------------------------------------------------*/
/*------------------------------USER IDENTITY-------------------------------*/
/*--------------------------------------------------------------------------*/
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

/*--------------------------------------------------------------------------*/
/*----------------------------TOKENS MANAGEMENT-----------------------------*/
/*--------------------------------------------------------------------------*/
  @Column({ nullable: true })
  MyHashedRefreshToken: string;
/*--------------------------------------------------------------------------*/
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

  @OneToMany(() => RoomEntity, room => room.roomCreator)
  createdRooms: RoomEntity[];

  @ManyToMany(() => RoomEntity, room => room.roomCurrentAdmins)
  administratedRooms: RoomEntity[];

  @ManyToMany(() => RoomEntity, room => room.members)
  MemberofRooms: RoomEntity[];
}
