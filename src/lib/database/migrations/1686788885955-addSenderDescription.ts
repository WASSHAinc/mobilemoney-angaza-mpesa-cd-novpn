import { MigrationInterface, QueryRunner } from "typeorm"

const MOBILE_MONEY_TYPE_NAME_AUTOMATIC = "added by auto (Opay (Nigeria))"
const MOBILE_MONEY_TYPE_NAME_MANUAL = "added by manual (Opay (Nigeria))"

export class  AddSenderDescription1686788885955 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO sender_description (sender_description, del_flag, created_at, updated_at)
            VALUES 
                (?, 0, now(), now()),
                (?, 0, now(), now());
        `, [MOBILE_MONEY_TYPE_NAME_AUTOMATIC, MOBILE_MONEY_TYPE_NAME_MANUAL])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM sender_description WHERE sender_description=?`, [MOBILE_MONEY_TYPE_NAME_AUTOMATIC]);
        await queryRunner.query(`DELETE FROM sender_description WHERE sender_description=?`, [MOBILE_MONEY_TYPE_NAME_MANUAL]);
    }

}
