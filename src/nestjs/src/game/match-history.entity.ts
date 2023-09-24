import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    OneToMany,
    JoinColumn,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { MatchEntity } from './match.entity';
import { Socket } from 'dgram';

@Entity('match-history')
export class MatchHistoryEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    total_parties: number;

    @Column()
    total_victoire: number;

    @Column()
    total_défaite: number;

    @Column({nullable:true})
    winrate: number;

    @OneToOne(() => UserEntity, (user) => user.matchHistory)
    user: UserEntity;

    @ManyToMany(() => MatchEntity,{
      eager: true,
    })
    @JoinTable()
    matches: MatchEntity[];
}