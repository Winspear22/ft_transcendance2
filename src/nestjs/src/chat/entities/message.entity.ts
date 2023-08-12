import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
  } from 'typeorm';
  
  @Entity('message')
  export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'text', comment: 'Sender of the message.' })
    sender: string;

    @Column({ type: 'text', comment: 'Content of the message.' })
    content: string;

    @CreateDateColumn({ type: 'timestamp', comment: 'Date when the message was sent.' })
    sentDate: Date;
  }
  