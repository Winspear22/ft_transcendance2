import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { RoomEntity } from './room.entity';  // assurez-vous que l'import est correct

@Entity('channel_messages')
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

  @Column()
  channelId: number;

  @ManyToOne(() => RoomEntity, room => room.messages)  // la relation inverse
  @JoinColumn({ name: 'channelId' })  // Cette ligne est optionnelle si vous suivez la convention de nommage par défaut
  room: RoomEntity;  // la propriété qui représente la relation
}
