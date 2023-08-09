// blacklisted-token.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
  } from 'typeorm';
  
  @Entity('blacklisted_tokens')
  export class BlacklistedToken {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    token: string;
  
    @Column()
    expiryDate: Date;
  }
  