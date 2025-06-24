import { MigrationInterface, QueryRunner } from "typeorm"

export class  ChangeOpayTransactionTableFormat1689881430584 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE opay_payments DROP COLUMN channel;`)
        await queryRunner.query(`ALTER TABLE opay_payments DROP COLUMN country;`)
        await queryRunner.query(`ALTER TABLE opay_payments DROP COLUMN fee;`)
        await queryRunner.query(`ALTER TABLE opay_payments DROP COLUMN fee_currency;`)
        await queryRunner.query(`ALTER TABLE opay_payments RENAME COLUMN displayed_failure TO error_message`)
        await queryRunner.query(`ALTER TABLE opay_payments RENAME COLUMN timestamp TO deposit_time`)
        await queryRunner.query(`ALTER TABLE opay_payments ADD COLUMN error_code varchar(10);`)
        await queryRunner.query(`ALTER TABLE opay_payments ADD COLUMN ref_id varchar(30);`)
        await queryRunner.query(`ALTER TABLE opay_payments ADD COLUMN deposit_code varchar(10);`)
        await queryRunner.query(`ALTER TABLE opay_payments DROP COLUMN instrument_type;`)
        await queryRunner.query(`ALTER TABLE opay_payments DROP COLUMN token;`)
        await queryRunner.query(`ALTER TABLE opay_payments DROP COLUMN refunded;`)
        await queryRunner.query(`ALTER TABLE opay_payments MODIFY amount INT NULL;`)
        await queryRunner.query(`ALTER TABLE opay_payments MODIFY currency VARCHAR(5) NULL;`)
        await queryRunner.query(`ALTER TABLE opay_payments MODIFY reference VARCHAR(30) NULL;`)
        await queryRunner.query(`ALTER TABLE opay_payments MODIFY transaction_id VARCHAR(30) NULL;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE opay_payments ADD COLUMN channel varchar(10);`)
        await queryRunner.query(`ALTER TABLE opay_payments ADD COLUMN country int;`)
        await queryRunner.query(`ALTER TABLE opay_payments ADD COLUMN fee int;`)
        await queryRunner.query(`ALTER TABLE opay_payments ADD COLUMN fee_currency varchar(4);`)
        await queryRunner.query(`ALTER TABLE opay_payments RENAME COLUMN errorMessage TO displayedFailure`)
        await queryRunner.query(`ALTER TABLE opay_payments RENAME COLUMN depositTime TO timestamp`)
        await queryRunner.query(`ALTER TABLE opay_payments DROP COLUMN errorCode;`)
        await queryRunner.query(`ALTER TABLE opay_payments DROP COLUMN refId;`)
        await queryRunner.query(`ALTER TABLE opay_payments ADD COLUMN instrument_type varchar(10);`)
        await queryRunner.query(`ALTER TABLE opay_payments ADD COLUMN token varchar(30);`)
        await queryRunner.query(`ALTER TABLE opay_payments DROP COLUMN deposit_code;`)
        await queryRunner.query(`ALTER TABLE opay_payments MODIFY amount INT NOT NULL;`)
        await queryRunner.query(`ALTER TABLE opay_payments MODIFY currency VARCHAR(5) NOT NULL;`)
        await queryRunner.query(`ALTER TABLE opay_payments MODIFY reference VARCHAR(20) NULL;`)
        await queryRunner.query(`ALTER TABLE opay_payments MODIFY transactionId VARCHAR(255) NULL;`)
    }

}
