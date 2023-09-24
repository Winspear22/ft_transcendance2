import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
  } from 'typeorm';
import { MatchHistoryEntity } from './match-history.entity';

@Entity('matchs')
export class MatchEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    player1: string;

    @Column()
    player2: string;

    @Column()
    player1_points: number;

    @Column()
    player2_points: number;
}
