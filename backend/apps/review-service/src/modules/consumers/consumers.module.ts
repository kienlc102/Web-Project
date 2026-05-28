import { Module } from '@nestjs/common';
import { OrderCompletedConsumer } from './order-completed.consumer';
import { ReviewsModule } from '../reviews/reviews.module';
import { InboxModule } from '../inbox/inbox.module';

@Module({
  imports: [ReviewsModule, InboxModule],
  providers: [OrderCompletedConsumer],
})
export class ConsumersModule {}
