import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { RoomEntity } from './room.entity';

@Entity('room_messages')
export class MessageEntity {
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

  @ManyToOne(() => RoomEntity, (room) => room.messages)
  room: RoomEntity;

  @Column()
  roomId: number;
}
