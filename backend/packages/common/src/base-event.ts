import { randomUUID } from 'crypto';

export interface BaseEvent<T = unknown> {
  eventId: string;
  eventType: string;
  aggregateType: string;
  eventName: string;
  aggregateId: string;
  occurredAt: string;
  producer: string;
  version: number;
  correlationId: string;
  payload: T;
}

export function createEvent<T>(
  eventType: string,
  aggregateId: string,
  payload: T,
  options: {
    aggregateType?: string;
    producer?: string;
    correlationId?: string;
    version?: number;
  } = {},
): BaseEvent<T> {
  return {
    eventId: randomUUID(),
    eventType,
    aggregateType: options.aggregateType ?? 'Unknown',
    eventName: eventType,
    aggregateId,
    occurredAt: new Date().toISOString(),
    producer: options.producer ?? 'unknown-service',
    version: options.version ?? 1,
    correlationId: options.correlationId ?? randomUUID(),
    payload,
  };
}
