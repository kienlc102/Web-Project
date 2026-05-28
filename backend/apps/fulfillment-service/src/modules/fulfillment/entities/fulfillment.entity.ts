import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'fulfillments' })
export class FulfillmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  orderId!: string;

  @Column()
  customerId!: string;

  @Column()
  sellerId!: string;

  @Column({ default: 'PENDING' })
  status!: string;

  @Column({ nullable: true })
  trackingCode?: string;

  @Column({ nullable: true })
  carrier?: string;

  @Column({ type: 'json', nullable: true })
  items?: Array<{
    productId: string;
    name?: string;
    quantity: number;
    unitPrice?: number;
    lineTotal?: number;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  packedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
