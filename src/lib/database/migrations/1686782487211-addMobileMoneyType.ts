import { MigrationInterface, QueryRunner } from "typeorm"
import { MOBILE_MONEY_TYPE_NAME } from "../entities";


export class  AddMobileMoneyType1686782487211 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO mobile_money_type (value, del_flag, created_at, updated_at)
            VALUES (?, 0, now(), now());
        `, [MOBILE_MONEY_TYPE_NAME])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM mobile_money_type WHERE value=?`, [MOBILE_MONEY_TYPE_NAME]);
    }

}
