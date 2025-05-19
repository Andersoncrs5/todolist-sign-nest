import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, VersionColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class RecoverPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 250, nullable: false, unique: true })
  token: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: false })
  expireAt: Date;

  @Column({ default: false })
  used: boolean;

  @VersionColumn()
  version: number;

  @OneToOne(() => User, (user) => user.recoverPassword)
  @JoinColumn()
  user: User;
}

