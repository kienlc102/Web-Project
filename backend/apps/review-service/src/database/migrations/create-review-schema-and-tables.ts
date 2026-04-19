import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewSchemaAndTables1712900001000
  implements MigrationInterface
{
  name = 'CreateReviewSchemaAndTables1712900001000';

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
      CREATE TABLE IF NOT EXISTS processed_messages (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        consumerName varchar(255) NOT NULL,
        messageId varchar(255) NOT NULL,
        processedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT UQ_review_processed_messages_consumer_message
          UNIQUE (consumerName, messageId)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS review.processed_messages`);
    await queryRunner.query(`DROP TABLE IF EXISTS review.review_eligibilities`);
    await queryRunner.query(`DROP DATABASE IF EXISTS review`);
  }
}