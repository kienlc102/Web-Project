import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingModule } from '@backend/messaging';
import dataSource from './database/typeorm.config';
import { ReviewEntity } from './modules/reviews/entities/review.entity';
import { ProcessedMessageEntity } from './modules/inbox/processed-message.entity';

@Module({
  imports: [
    MessagingModule,
    TypeOrmModule.forRoot({
      ...dataSource.options,
      autoLoadEntities: false,
    }),
    TypeOrmModule.forFeature([ReviewEntity, ProcessedMessageEntity]),
  ],
})
export class AppModule {}