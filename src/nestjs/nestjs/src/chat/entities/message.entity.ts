import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne
  } from 'typeorm';
import { RoomEntity } from './room.entity';
  
@Entity('message')
export class MessageEntity 
{
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type: 'text', comment: 'Sender of the message.' })
  sender: string;

  @Column({ type: 'text', comment: 'Content of the message.' })
  content: string;

  @CreateDateColumn({ type: 'timestamp', comment: 'Date when the message was sent.' })
  sentDate: Date;

  @ManyToOne(() => RoomEntity, room => room.messages)
  room: RoomEntity;
}
  