import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import * as bcrypt from "bcrypt";
import { Task } from "src/task/entities/task.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 250, nullable: false })
    name: string;

    @Column({ type: "varchar", unique: true, length: 250, nullable: false })
    email: string;

    @Column({ type: "varchar", length: 250, nullable: false })
    password: string;

    @Column({ type: "varchar" , length: 500, nullable: true})
    refreshToken: string | null;

    @OneToMany(() => Task, (task) => task.user)
    tasks: Task[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 15);
        }
    }
}
