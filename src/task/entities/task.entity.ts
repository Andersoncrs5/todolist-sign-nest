import { User } from "../../user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type:"varchar", length : 150, nullable: false })
    title: string

    @Column({type:"varchar", length : 300, nullable: false })
    description: string

    @Column({ default: true, nullable: false })
    done: boolean = true;

    @ManyToOne(() => User, (user) => user.tasks, { onDelete : 'CASCADE', nullable: false, eager: true })
    user: User;

    @VersionColumn()
    version: number;

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
