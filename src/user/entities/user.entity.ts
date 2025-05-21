import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";
import * as bcrypt from "bcrypt";
import { Task } from "../../task/entities/task.entity";
import { RecoverPassword } from "./recoverPassoword.entity";
import { UserMetric } from "src/user_metric/entities/user_metric.entity";

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

    @OneToOne(() => RecoverPassword, (recover) => recover.user, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    recoverPassword: RecoverPassword;

    @OneToOne(() => UserMetric, (metric) => metric.user)
    metric: UserMetric;

    @VersionColumn()
    version: number;

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
