import { RSAUtil } from '@utils';
import * as Errors from "@errors";
import { NIGERIA_COUNTRY_CODE } from './app.types';
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from 'supertest'
import { Test } from '@nestjs/testing';
import { AppModule } from "./app.module";
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AgentEntity, DatabaseModule, PhoneEntity, DistrictEntity, RegionEntity, MobileMoneyTypeEntity, MemeSellEntity, AirwattIssueReadyEntity, ReceivePaymentNotificationDto, CurrencyEnum, PaymentNotificationPayloadDto } from './lib/database';
import ormConfig from './lib/database/config/ormconfig';
import { In, Repository, getConnection } from 'typeorm';
import {v4 as uuidv4} from 'uuid';

const generateRandomTransactionId = function() {
    const min = 10000000000; // Minimum 11-digit integer
    const max = 99999999999; // Maximum 11-digit integer
    return  Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Make sure to update the test to match the your implementation. you should test for the following:
 * 1. If you have any encryption or decryption mechanism, test that it works
 * 2. Test the authentication mechanism
 * 3. Test Using accepted and false phone numbers
 * 4. Test re-using transaction IDs
 */


describe('Process received notification from OPay',() => {
    const rSAUtil: RSAUtil = new RSAUtil();

    let app: INestApplication;
    const sampleSuccessRequestPayload: { data: PaymentNotificationPayloadDto } = {
        data: {
            status: "SUCCESS",
            transactionId: '' + generateRandomTransactionId(),
            reference: "25254545",
            depositCode: "6126390625",
            refId: "refer1200000850",
            currency: CurrencyEnum.NGN,
            depositAmount: "49160",
            fee: "16.00",
            depositTime: "1663153219000",
        }
    }

    const sampleFailedRequestPayload: { data: PaymentNotificationPayloadDto }= {
        data: {
            status: "FAIL",
            transactionId: "20220319702512368471543808", 
            reference: "220617145660907314088", 
            errorCode: "00003",
            errorMsg: "SYSTEM ERROR"
        }
    }

    let agentEntity: AgentEntity;
    let phoneEntity: PhoneEntity;
    let regionEntity: RegionEntity;
    let districtEntity: DistrictEntity;
    let mobileMoneyTypeEntity: MobileMoneyTypeEntity;

    let agentRepository: Repository<AgentEntity>;
    let phoneRepository: Repository<PhoneEntity>;
    let regionRepository: Repository<RegionEntity>;
    let districtRepository: Repository<DistrictEntity>;
    let mobileMoneyTypeRepository: Repository<MobileMoneyTypeEntity>;
    let airwattIssueReadyRepository: Repository<AirwattIssueReadyEntity>;
    let memeSellRepository: Repository<MemeSellEntity>

    const createdMemeSaleIds: string[] = [];


    beforeAll(async () => {

        const moduleRef = await Test.createTestingModule({
            imports: [
                DatabaseModule, 
                AppModule, 
                TypeOrmModule.forRoot(ormConfig),
                TypeOrmModule.forFeature([AgentEntity, PhoneEntity, RegionEntity, DistrictEntity, MobileMoneyTypeEntity, AirwattIssueReadyEntity, MemeSellEntity])
            ]
        })
        .compile();
        
        phoneRepository = moduleRef.get<Repository<PhoneEntity>>(getRepositoryToken(PhoneEntity));
        agentRepository = moduleRef.get<Repository<AgentEntity>>(getRepositoryToken(AgentEntity));
        regionRepository = moduleRef.get<Repository<RegionEntity>>(getRepositoryToken(RegionEntity));
        districtRepository = moduleRef.get<Repository<DistrictEntity>>(getRepositoryToken(DistrictEntity));
        mobileMoneyTypeRepository = moduleRef.get<Repository<MobileMoneyTypeEntity>>(getRepositoryToken(MobileMoneyTypeEntity));
        airwattIssueReadyRepository = moduleRef.get<Repository<AirwattIssueReadyEntity>>(getRepositoryToken(AirwattIssueReadyEntity));
        memeSellRepository = moduleRef.get<Repository<MemeSellEntity>>(getRepositoryToken(MemeSellEntity));

        app = moduleRef.createNestApplication();
        await app.init();
        await createPhoneNumber()
        
    })

    async function createPhoneNumber() {

        regionEntity = new RegionEntity()
        regionEntity.value = 'Sample Region ' + uuidv4()
        regionEntity.countryID = 3;
        regionEntity.createdAt = new Date();
        regionEntity.updatedAt = new Date();
        regionEntity.delFlag = false;

        const region = await regionRepository.insert(regionEntity)

        regionEntity.id = region.identifiers[0].id
    
        districtEntity = new DistrictEntity()
        districtEntity.value = 'Sample District ' + uuidv4()
        districtEntity.regionID = regionEntity.id;
        districtEntity.createdAt = new Date();
        districtEntity.updatedAt = new Date();
        districtEntity.delFlag = false;

        const district = await districtRepository.insert(districtEntity)

        districtEntity.id = district.identifiers[0].id
        
        agentEntity = new AgentEntity()

        agentEntity.serialNumber = Math.floor(Math.random() * 11111);
        agentEntity.lastName = "Doe";
        agentEntity.firstName = "John";
        agentEntity.country = 3;
        agentEntity.region = regionEntity.id;
        agentEntity.district = districtEntity.id;
        agentEntity.isEndUser = true;
        agentEntity.status = '2';
        agentEntity.gender = '2';
        agentEntity.createdAt = new Date();
        agentEntity.updatedAt = new Date();

        const agent = await agentRepository.insert(agentEntity)

        agentEntity.id = agent.identifiers[0].id

        mobileMoneyTypeEntity = await mobileMoneyTypeRepository.findOneBy({value: "Opay (Nigeria)"})

        phoneEntity = new PhoneEntity()

        phoneEntity.agent = agentEntity;
        phoneEntity.phoneNo = NIGERIA_COUNTRY_CODE + Math.floor(100000 + Math.random() * 90000000);
        phoneEntity.mobileMoneyType = mobileMoneyTypeEntity;
        phoneEntity.registeredFirstName = "john",
        phoneEntity.registeredMiddleName = "john",
        phoneEntity.registeredLastName = "doel",     
        phoneEntity.registeredId = "12334"
        phoneEntity.createdAt = new Date();
        phoneEntity.updatedAt = new Date();
        phoneEntity.isSmsPasscode = true;

        const phone = await phoneRepository.insert(phoneEntity)

        phoneEntity.id = phone.identifiers[0].id

        sampleSuccessRequestPayload.data.refId = phoneEntity.phoneNo
        sampleFailedRequestPayload.data.refId = phoneEntity.phoneNo
    }

    it('Test if the encryption keys work', async () => {
        const encryptedData = rSAUtil.encrypt(JSON.stringify(sampleSuccessRequestPayload.data))
        const decrypted: PaymentNotificationPayloadDto  = JSON.parse(rSAUtil.decrypt(JSON.stringify(encryptedData))) as PaymentNotificationPayloadDto;
        expect(sampleSuccessRequestPayload.data).toEqual(decrypted);
    })

    it('Test the provided message decrypts', async () => {
        const encryptedData = "djo7EFomBWDClyORzHfqvAnqQ+mqYBzaOkhwlssxQ8f5LmWqJyhJXKuRBgfWNCJDBG4fHY2Vv1R+Es8Yut2YkQPOpXSjPLWaUZNlS6Ha2kotqB+dSkD76dhMfsMIvmQyf0m/EeZxkGgwP3Ddf/N/HL22Riycyq6pKrDbnN5ykQ1La/mW6GYNc2ElD9BQveupw5VL90uJ/jvTjCqhpjY15kTKl6wplGXuUO35ZicVrW+hBmQvxIHBcF2fmA4I+tTAqcdJ2S1/N6lDM0qsNFmKeQTJwbwNpfWA/A9NS5waUpaKYd5KPyUzxUNLbKD6JD4pKnugeC33smU6N1d5PG1q/X+93oi8ahQXnvb/I4dtOBElInYRZZb3PD8Njr9+wNBsyYXEhHeqYpVqBX0H1wGBvOtS0iL/l8Hxn+u9KcWxA4eqN6ca6E7Fc4muzuaYtZWWfXXJ/dTxmMYW2CytGTWolR/qDvW6CW9waMZB1bgMFisIILm241K6CaRWYfMUDRVRZvukAPNn9kkaWTEXoGZ1GOgs4TB6j5MbFJMbfA6T/nP53xcVg5TZh6a/6x7fv23cQcEjPdF9mF8BkHAzKesWEywT698sDhpZeEG9fuKx2BUHCrNHgiYPnME0odQiihjnMC6weBz1ORtS+H+vpk8BEIyCQzwulT4Oh9QfeZx2/Js="
        const decrypted = JSON.parse(rSAUtil.decrypt(encryptedData)) as PaymentNotificationPayloadDto;
        expect(decrypted).toEqual(decrypted);
        expect(decrypted.reference).toEqual('23486897433')
        expect(decrypted.depositAmount).toEqual('49160')
        expect(decrypted.depositCode).toEqual('6126390625')
        expect(decrypted.currency).toEqual('NGN')
        expect(decrypted.refId).toEqual('refer1200000850')
        expect(decrypted.depositTime).toEqual('1663153219000')
        expect(decrypted.transactionId).toEqual('220507145660712931829')
        expect(decrypted.status).toEqual('SUCCESS')
    })

    it('Send notification with refId that match Agent phone number', async () => {
        await request(app.getHttpServer())
            .post('/api/receivePaymentNotification/')
            .send({ data: rSAUtil.encrypt(JSON.stringify(sampleSuccessRequestPayload.data))})
            .expect(HttpStatus.CREATED)
            .then(function(response: any) {
                createdMemeSaleIds.push(response.body.id)
                expect(response.body.id).not.toBeNull()
                expect(response.body.code).toBe('00000')
                expect(response.body.message).toBe('SUCCESSFUL')
                expect(response.body.agent.id).toBe(agentEntity.id)
                expect(response.body.agent.firstName).toBe(agentEntity.firstName)
                expect(response.body.agent.lastName).toBe(agentEntity.lastName)
            })
    })

    it('Send notification with the same transaction ID', async () => {
        await request(app.getHttpServer())
            .post('/api/receivePaymentNotification/')
            .send({ data: rSAUtil.encrypt(JSON.stringify(sampleSuccessRequestPayload.data))})
            .expect(HttpStatus.INTERNAL_SERVER_ERROR)
            .then(function(error: any) {
                expect(error.body.message).toBe(Errors.DUPLICATE_OPAY_TRANSACTION)
            })
    })

    it('Send notification with refId that match any Agent phone number with a trailing zero instead of country code', async () => {
        await request(app.getHttpServer())
            .post('/api/receivePaymentNotification/')
            .send({
                data: rSAUtil.encrypt(JSON.stringify({ 
                    ...sampleSuccessRequestPayload.data, 
                    refId: sampleSuccessRequestPayload.data.refId?.replace(NIGERIA_COUNTRY_CODE, "0"),
                    transactionId: generateRandomTransactionId()
                }))
            })
            .expect(HttpStatus.CREATED)
            .then(function(response: any) {
                createdMemeSaleIds.push(response.body.id)
                expect(response.body.id).not.toBeNull()
                expect(response.body.code).toBe('00000')
                expect(response.body.message).toBe('SUCCESSFUL')
                expect(response.body.agent.id).toBe(agentEntity.id)
                expect(response.body.agent.firstName).toBe(agentEntity.firstName)
                expect(response.body.agent.lastName).toBe(agentEntity.lastName)
            })
    })

    it('Send notification with reference that does not match any Agent phone number', async () => {
        await request(app.getHttpServer())
            .post('/api/receivePaymentNotification/')
            .send({
                data: rSAUtil.encrypt(JSON.stringify({ 
                    ...sampleSuccessRequestPayload.data, 
                    refId: NIGERIA_COUNTRY_CODE + Math.floor(100000 + Math.random() * 90000000),
                    transactionId: generateRandomTransactionId()
                }))
            })
            .expect(HttpStatus.INTERNAL_SERVER_ERROR)
            .then(function(error: any) {
                expect(error.body.message).toBe(Errors.AGENT_DOES_NOT_EXIST)
            })
    })

    it('Send notification with zero depositAmount', async () => {
        await request(app.getHttpServer())
            .post('/api/receivePaymentNotification/')
            .send({
                data: rSAUtil.encrypt(JSON.stringify({ 
                    ...sampleSuccessRequestPayload.data, 
                    depositAmount: '0',
                    transactionId: generateRandomTransactionId()
                }))
            })
            .expect(HttpStatus.INTERNAL_SERVER_ERROR)
            .then(function(error: any) {
                expect(error.body.message).toBe(Errors.PAYMENT_AMOUNT_NOT_SUFFICIENT)
            })
    })

    it('Send notification with no depositAmount', async () => {
        await request(app.getHttpServer())
            .post('/api/receivePaymentNotification/')
            .send({
                data: rSAUtil.encrypt(JSON.stringify({ 
                    ...sampleSuccessRequestPayload.data, 
                    depositAmount: '',
                    transactionId: generateRandomTransactionId()
                }))
            })
            .expect(HttpStatus.INTERNAL_SERVER_ERROR)
            .then(function(error: any) {
                expect(error.body.message).toBe(Errors.PAYMENT_AMOUNT_NOT_SUFFICIENT)
            })
    })

    it('Send notification with status failed', async () => {
        await request(app.getHttpServer())
            .post('/api/receivePaymentNotification/')
            .send({data: rSAUtil.encrypt(JSON.stringify({
                ...sampleFailedRequestPayload.data,
                transactionId: generateRandomTransactionId()
            })) })
            .expect(HttpStatus.INTERNAL_SERVER_ERROR)
            .then(function(error: any) {
                expect(error.body.message).toBe(Errors.OPAY_TRANSACTION_FAILED)
            })
    })

    afterAll(async () => {
        await airwattIssueReadyRepository.delete({memeSell: { id: In(createdMemeSaleIds.map(createdMemeSaleId => parseInt(createdMemeSaleId)))}}) 
        await memeSellRepository.delete({id: In(createdMemeSaleIds.map(createdMemeSaleId => parseInt(createdMemeSaleId)))})
        await phoneRepository.delete({id: phoneEntity.id});
        await agentRepository.delete({id: agentEntity.id});
        await districtRepository.delete({id: districtEntity.id});
        await regionRepository.delete({id: regionEntity.id});
        await app.close();
    })
})
