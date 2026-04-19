import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'processed_messages' })
@Unique(['consumerName', 'messageId'])
export class ProcessedMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  consumerName: string;

  @Column()
  messageId: string;

  @CreateDateColumn()
  processedAt: Date;
}