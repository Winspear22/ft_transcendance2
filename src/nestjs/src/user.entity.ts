import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  
@Entity()
export class UserEntity 
{
  @PrimaryGeneratedColumn()
  id: number;
  
 @Column({ length: 500 })
  username: string;

}
  