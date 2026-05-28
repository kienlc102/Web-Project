import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewEligibilityProductId1712900001000
  implements MigrationInterface
{
  name = 'AddReviewEligibilityProductId1712900001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn(
      'review_eligibilities',
      'productId',
    );
    if (!hasColumn) {
      await queryRunner.query(
        `ALTER TABLE review_eligibilities ADD productId varchar(255) NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn(
      'review_eligibilities',
      'productId',
    );
    if (hasColumn) {
      await queryRunner.query(
        `ALTER TABLE review_eligibilities DROP COLUMN productId`,
      );
    }
  }
}
