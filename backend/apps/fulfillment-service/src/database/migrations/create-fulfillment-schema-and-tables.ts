import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFulfillmentSchemaAndTables1712900000000
  implements MigrationInterface
{
  name = 'CreateFulfillmentSchemaAndTables1712900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE DATABASE IF NOT EXISTS fulfillment`);
    await queryRunner.query(`USE fulfillment`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS fulfillments (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        orderId varchar(255) NOT NULL,
        customerId varchar(255) NOT NULL,
        sellerId varchar(255) NOT NULL,
        status varchar(255) NOT NULL DEFAULT 'PENDING',
        trackingCode varchar(255) NULL,
        carrier varchar(255) NULL,
        packedAt timestamp NULL,
        shippedAt timestamp NULL,
        deliveredAt timestamp NULL,
        completedAt timestamp NULL,
        cancelledAt timestamp NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS processed_messages (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        consumerName varchar(255) NOT NULL,
        messageId varchar(255) NOT NULL,
        processedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT UQ_fulfillment_processed_messages_consumer_message
          UNIQUE (consumerName, messageId)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS outbox (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        eventId varchar(255) NOT NULL UNIQUE,
        eventName varchar(255) NOT NULL,
        aggregateId varchar(255) NOT NULL,
        payload json NOT NULL,
        status varchar(255) NOT NULL DEFAULT 'PENDING',
        retries int NOT NULL DEFAULT 0,
        lastError text NULL,
        publishedAt timestamp NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS fulfillment.outbox`);
    await queryRunner.query(`DROP TABLE IF EXISTS fulfillment.processed_messages`);
    await queryRunner.query(`DROP TABLE IF EXISTS fulfillment.fulfillments`);
    await queryRunner.query(`DROP DATABASE IF EXISTS fulfillment`);
  }
}