import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export default abstract class BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id?: number;

  @CreateDateColumn({ name: 'created_at', default: Date.now(), type: 'timestamp'  })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', default: Date.now(), type: 'timestamp' })
  updatedAt: Date;

}
