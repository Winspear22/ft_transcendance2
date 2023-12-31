import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { MessageEntity } from './message.entity';

@Entity('rooms')
export class RoomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('int', { array: true })
  users: number[];

  @Column('int', { array: true })
  admins: number[];

  @Column('int')
  owner: number;

  @Column('int', { array: true })
  bannedIds: number[];

  @Column('int', { array: true })
  mutedIds: number[];

  @Column('int', { array: true })
  pendingIds: number[];

  @Column({ unique: true })
  roomName: string;

  @Column()
  roomMode: string;

  @Column({ nullable: true })
  password?: string;

  @Column()
  isPrivate: boolean;

  //@OneToMany(() => MessageEntity, (message) => message.room)
  //messages: MessageEntity[];
  @OneToMany(() => MessageEntity, (message) => message.room, {
    cascade: ['remove']
  })
  messages: MessageEntity[];
  
}
