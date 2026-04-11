import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingModule } from '@backend/messaging';
import dataSource from './database/typeorm.config';
import { FulfillmentEntity } from './modules/fulfillment/entities/fulfillment.entity';
import { ProcessedMessageEntity } from './modules/inbox/processed-message.entity';
import { OutboxEntity } from './modules/outbox/outbox.entity';

@Module({
  imports: [
    MessagingModule,
    TypeOrmModule.forRoot({
      ...dataSource.options,
      autoLoadEntities: false,
    }),
    TypeOrmModule.forFeature([
      FulfillmentEntity,
      ProcessedMessageEntity,
      OutboxEntity,
    ]),
  ],
})
export class AppModule {}