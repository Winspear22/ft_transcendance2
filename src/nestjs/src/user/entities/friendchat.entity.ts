import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToMany,
    JoinTable
  } from 'typeorm';
  import { FriendMessage } from './friendmessage.entity';
  import { UserEntity } from '../user.entity';
  
  @Entity()
  export class FriendChat {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    room: string;
  
    @OneToMany(() => FriendMessage, (message) => message.chat)
    messages: FriendMessage[];

    @ManyToMany(() => UserEntity)
    @JoinTable()
    users: UserEntity[];

  }
  