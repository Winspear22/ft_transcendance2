import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
    OneToMany,
    ManyToOne
  } from 'typeorm';
import { UserEntity } from '../../user/user.entity';
import { MessageEntity } from './message.entity';

@Entity('room')
export class RoomEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', unique: true })
    name: string;

    @ManyToOne(() => UserEntity)
    roomCreator: UserEntity;

    @ManyToOne(() => UserEntity)
    roomCurrentAdmin: UserEntity;

    @ManyToMany(() => UserEntity, user => user.rooms)
    @JoinTable() // Ceci crée automatiquement une table de jointure
    members: UserEntity[];

    @OneToMany(() => MessageEntity, message => message.room, { cascade: true })
    messages: MessageEntity[];
}