import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { UserEntity } from '../user.entity';
  
  @Entity()
  export class Friend {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    friendId: number;
  
    @Column()
    chatId: number;
  
    @ManyToOne(() => UserEntity, (user) => user.friends)
    @JoinColumn({ name: 'userId' }) // this column stores the relation id
    user: UserEntity;
  
    @Column()
    userId: number;
  }
  