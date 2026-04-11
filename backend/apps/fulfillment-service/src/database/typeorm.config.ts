import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { FulfillmentEntity } from '../modules/fulfillment/entities/fulfillment.entity';
import { ProcessedMessageEntity } from '../modules/inbox/processed-message.entity';
import { OutboxEntity } from '../modules/outbox/outbox.entity';

const isTsNode = __filename.endsWith('.ts');

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'ecommerce',
  schema: 'fulfillment',
  entities: [FulfillmentEntity, ProcessedMessageEntity, OutboxEntity],
  migrations: isTsNode
    ? ['apps/fulfillment-service/src/database/migrations/*.ts']
    : ['dist/apps/fulfillment-service/src/database/migrations/*.js'],
  synchronize: false,
  logging: true,
});