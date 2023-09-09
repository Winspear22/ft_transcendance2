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
  import { Expose } from 'class-transformer';

  
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
    
    @Expose() // Assurez-vous d'avoir ce décorateur
    @ManyToOne(() => FriendChat, (chat) => chat.messages)
    @JoinColumn({ name: 'chatId' })
    chat: FriendChat;
  
    @Column()
    chatId: number;
  }
  