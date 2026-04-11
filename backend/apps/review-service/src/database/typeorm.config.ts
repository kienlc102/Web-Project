import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ReviewEntity } from '../modules/reviews/entities/review.entity';
import { ProcessedMessageEntity } from '../modules/inbox/processed-message.entity';

const isTsNode = __filename.endsWith('.ts');

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'ecommerce',
  schema: 'review',
  entities: [ReviewEntity, ProcessedMessageEntity],
  migrations: isTsNode
    ? ['apps/review-service/src/database/migrations/*.ts']
    : ['dist/apps/review-service/src/database/migrations/*.js'],
  synchronize: false,
  logging: true,
});