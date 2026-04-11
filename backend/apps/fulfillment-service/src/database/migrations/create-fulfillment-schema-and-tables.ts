import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFulfillmentSchemaAndTables1712900000000
  implements MigrationInterface
{
  name = 'CreateFulfillmentSchemaAndTables1712900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS fulfillment`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS fulfillment.fulfillments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "orderId" varchar NOT NULL,
        "customerId" varchar NOT NULL,
        "sellerId" varchar NOT NULL,
        status varchar NOT NULL DEFAULT 'PENDING',
        "trackingCode" varchar NULL,
        carrier varchar NULL,
        "packedAt" timestamp NULL,
        "shippedAt" timestamp NULL,
        "deliveredAt" timestamp NULL,
        "completedAt" timestamp NULL,
        "cancelledAt" timestamp NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS fulfillment.processed_messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "consumerName" varchar NOT NULL,
        "messageId" varchar NOT NULL,
        "processedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_fulfillment_processed_messages_consumer_message"
          UNIQUE ("consumerName", "messageId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS fulfillment.outbox (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "eventId" varchar NOT NULL UNIQUE,
        "eventName" varchar NOT NULL,
        "aggregateId" varchar NOT NULL,
        payload jsonb NOT NULL,
        status varchar NOT NULL DEFAULT 'PENDING',
        retries int NOT NULL DEFAULT 0,
        "lastError" text NULL,
        "publishedAt" timestamp NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS fulfillment.outbox`);
    await queryRunner.query(`DROP TABLE IF EXISTS fulfillment.processed_messages`);
    await queryRunner.query(`DROP TABLE IF EXISTS fulfillment.fulfillments`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS fulfillment CASCADE`);
  }
}