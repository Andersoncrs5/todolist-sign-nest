import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Task {

    @PrimaryGeneratedColumn()
    id: number

    @Column({type:"varchar", length : 150 })
    title: string

    @Column({type:"varchar", length : 300 })
    description: string

    @Column({ default: true })
    done: boolean

    @ManyToOne(() => User, (user) => user.tasks, { onDelete : 'CASCADE' } )
    user: User;

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
