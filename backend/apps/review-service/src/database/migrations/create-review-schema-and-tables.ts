import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewSchemaAndTables1712900001000
  implements MigrationInterface
{
  name = 'CreateReviewSchemaAndTables1712900001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS review`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS review.review_eligibilities (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "fulfillmentId" varchar NOT NULL,
        "orderId" varchar NOT NULL,
        "customerId" varchar NOT NULL,
        "sellerId" varchar NOT NULL,
        "isEligible" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS review.processed_messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "consumerName" varchar NOT NULL,
        "messageId" varchar NOT NULL,
        "processedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_review_processed_messages_consumer_message"
          UNIQUE ("consumerName", "messageId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS review.processed_messages`);
    await queryRunner.query(`DROP TABLE IF EXISTS review.review_eligibilities`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS review CASCADE`);
  }
}