import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
  } from 'typeorm';
  import { FriendMessage } from './friendmessage.entity';
  
  @Entity()
  export class FriendChat {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    room: string;
  
    @OneToMany(() => FriendMessage, (message) => message.chat)
    messages: FriendMessage[];
  }
  