import { Global, Module } from '@nestjs/common';
import { RabbitmqConsumer } from './rabbitmq.consumer';
import { RabbitmqPublisher } from './rabbitmq.publisher';
import {
  rabbitChannelProvider,
  rabbitConnectionProvider,
} from './rabbitmq.provider';

@Global()
@Module({
  providers: [
    rabbitConnectionProvider,
    rabbitChannelProvider,
    RabbitmqPublisher,
    RabbitmqConsumer,
  ],
  exports: [RabbitmqPublisher, RabbitmqConsumer],
})
export class MessagingModule {}