import { 
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn
  } from 'typeorm';
import { Friend } from './entities/friend.entity';
import { MatchHistoryEntity } from 'src/game/match-history.entity';

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

  @Column('int', { array: true, nullable: true })
  blockedIds: number[];

  @OneToMany(() => Friend, (friend) => friend.user)
  friends: Friend[];

  @Column('int', { array: true, nullable: true })
  friendRequests: number[];


  /*@Column('int', { array: true, default: '{}' })
  friendRequests: number[];*/

  @OneToOne(() => MatchHistoryEntity, (matchHistory) => matchHistory.user, {
    eager: true,
  })
  @JoinColumn()
  matchHistory: MatchHistoryEntity;
}