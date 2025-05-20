import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";

@Entity()
export class UserMetric {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.metric)
    @JoinColumn()
    user: User

    @Column({ default: 0 })
    totalTasksCreated: number = 0; 

    @Column({ default: 0 })
    totalTasksCompleted: number = 0; 

    @Column({ default: 0 })
    totalTasksDeleted: number = 0; 

    @Column({ default: 0 })
    tasksCompletedToday: number = 0; 

    @Column({ default: 0 })
    totalTasksCreatedToday: number = 0;

    @Column({ default: 0 })
    consecutiveDaysActive: number = 0;

    @Column({ type: 'float', default: 0 })
    averageTasksCompletedPerDay: number = 0;

    @Column({ type: 'timestamp', nullable: true })
    lastTaskCreatedAt: Date; 

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date; 

    @Column({ default: false })
    emailVerified: boolean;

    @Column({ default: false })
    wishReceiveMetricByEmail: boolean = false;

    @Column({ type: 'timestamp', nullable: true })
    firstTaskCompletedAt: Date;

    @VersionColumn()
    version: number = 0;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
