import { Inject, Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RABBITMQ_CHANNEL } from './rabbitmq.provider';

@Injectable()
export class RabbitmqPublisher {
  constructor(
    @Inject(RABBITMQ_CHANNEL)
    private readonly channel: amqp.Channel,
  ) {}

  async publish(exchange: string, routingKey: string, message: unknown) {
    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        contentType: 'application/json',
      },
    );
  }
}