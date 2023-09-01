import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable
  } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';

@Entity('room2')
export class RoomEntity2
{

  /*================IDENTIFICATION DE LA ROOM================*/
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true, default: ""})
  name: string;

  /*=========================================================*/
  /*=====================TYPE DE LA ROOM=====================*/
  @Column('boolean', {default: false})
  publicRoom: boolean;
  
  @Column("text", {default: ""})
  password: string;
  
  @Column("simple-array", {default: []})
  allowedUsersInRoom: string[]; //authPrivateChannelUsers
  
  @Column('boolean', {default: false})
  directMessage: boolean;

  /*================CREATEURS/ADMINS/MEMBRES=================*/
  @Column("text", {default: ""})
	roomOwner: string;

  @Column("simple-array", {default: []})
	roomAdministrators: string[];
  
  @ManyToMany(() => UserEntity, {onDelete:'CASCADE'})
	@JoinTable()
	users: UserEntity[];

}