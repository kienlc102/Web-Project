import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFulfillmentItemsColumn1712900001000
  implements MigrationInterface
{
  name = 'AddFulfillmentItemsColumn1712900001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn(
      'fulfillments',
      'items',
    );
    if (!hasColumn) {
      await queryRunner.query(`ALTER TABLE fulfillments ADD items json NULL`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn(
      'fulfillments',
      'items',
    );
    if (hasColumn) {
      await queryRunner.query(`ALTER TABLE fulfillments DROP COLUMN items`);
    }
  }
}
