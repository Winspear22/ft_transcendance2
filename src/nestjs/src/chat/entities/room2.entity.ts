import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
  } from 'typeorm';

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
  publicChannel: boolean;
  
  @Column("text", {default: ""})
  password: string;
  
  @Column("simple-array", {default: []})
  allowedUsersInChannel: string[]; //authPrivateChannelUsers
  
  @Column('boolean', {default: false})
  directMessage: boolean;

  /*================CREATEURS/ADMINS/MEMBRES=================*/

}