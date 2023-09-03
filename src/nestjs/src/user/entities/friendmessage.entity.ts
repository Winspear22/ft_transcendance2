import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn
  } from 'typeorm';
  import { FriendChat } from './friendchat.entity';
  
  @Entity()
  export class FriendMessage {
    @PrimaryGeneratedColumn()
    id: number;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @Column()
    senderId: number;
  
    @Column('text')
    text: string;
  
    @ManyToOne(() => FriendChat, (chat) => chat.messages)
    @JoinColumn({ name: 'chatId' })
    chat: FriendChat;
  
    @Column()
    chatId: number;
  }
  