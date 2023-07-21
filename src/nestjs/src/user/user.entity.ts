import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column('text', { default: '' })
  login42: string;

  @Column('text', { default: 'empty' })
  profile_picture: string;

  /* COMING FROM THE WANAGO TUTORIAL */

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  public twoFactorAuthenticationSecret?: string;
}
