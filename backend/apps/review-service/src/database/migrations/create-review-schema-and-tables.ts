import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewSchemaAndTables1712900000000
  implements MigrationInterface
{
  name = 'CreateReviewSchemaAndTables1712900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE DATABASE IF NOT EXISTS review`);
    await queryRunner.query(`USE review`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS review_eligibilities (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        fulfillmentId varchar(255) NOT NULL,
        orderId varchar(255) NOT NULL,
        customerId varchar(255) NOT NULL,
        sellerId varchar(255) NOT NULL,
        isEligible tinyint(1) NOT NULL DEFAULT 1,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        productId varchar(255) NOT NULL,
        customerId varchar(255) NOT NULL,
        orderId varchar(255) NOT NULL,
        fulfillmentId varchar(255) NOT NULL,
        rating int NOT NULL,
        comment text NOT NULL,
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
        CONSTRAINT UQ_review_processed_messages_consumer_message
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
    await queryRunner.query(`DROP TABLE IF EXISTS review.outbox`);
    await queryRunner.query(`DROP TABLE IF EXISTS review.processed_messages`);
    await queryRunner.query(`DROP TABLE IF EXISTS review.reviews`);
    await queryRunner.query(`DROP TABLE IF EXISTS review.review_eligibilities`);
    await queryRunner.query(`DROP DATABASE IF EXISTS review`);
  }
}