import { MigrationInterface, QueryRunner } from "typeorm"

export class  CreateOpayPaymentsTable1686776659669 implements MigrationInterface {
    //TODO: optimize this more
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS opay_payments (
            id SERIAL PRIMARY KEY,
            amount numeric NOT NULL,
            channel varchar(255) NOT NULL,
            country varchar(5) NOT NULL,
            currency varchar(5) NOT NULL,
            displayed_failure text NULL,
            fee int NOT NULL,
            fee_currency varchar(255) NOT NULL,
            instrument_type varchar(255) NOT NULL,
            reference varchar(20) NOT NULL,
            refunded boolean NOT NULL,
            status varchar(20) NOT NULL,
            timestamp timestamp NOT NULL,
            token varchar(255) NOT NULL,
            transaction_id varchar(255) NOT NULL,
            created_at timestamp NOT NULL DEFAULT now(),
            updated_at timestamp NOT NULL DEFAULT now()
        );
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE opay-payments;`);
    }

}
