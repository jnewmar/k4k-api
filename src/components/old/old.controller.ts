import { Controller, Post, Body, Res } from '@nestjs/common';
import { IuguService } from '../../components/payment-gateway/iugu/iugu.service';
import { ChargeRaceRequest } from './chargeRaceRequest';
import { Response } from 'express';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseCloudMessagingService } from '../../services/firebase-cloud-messaging/firebase-cloud-messaging.service';
import { AcceptRace } from './acceptRace';
import { CancelRace } from './cancelRace';
import { WalletService } from '../wallet/wallet.service';
import { InjectRepository } from '@nestjs/typeorm';
import Driver from '../../entities/driver.entity';
import { Repository } from 'typeorm';
import BankData from '../../entities/bank-data.entity';
import Address from '../../entities/address.entity';

@Controller('old')
export class OldController {
    constructor(
        @InjectRepository(Driver) private driverRepository: Repository<Driver>,
        @InjectRepository(BankData) private bankDataRepository: Repository<BankData>,
        @InjectRepository(Address) private addressRepository: Repository<Address>,
        private readonly iuguService: IuguService,
        private readonly walletService: WalletService, 
        private readonly fcmService: FirebaseCloudMessagingService, 
        private readonly firebaseService: FirebaseService) {}

    @Post('chargeRace')
    async chargeRaceAndNotifyDrivers(@Res() response: Response, @Body() chargeRaceRequest: ChargeRaceRequest): Promise<any> {
        try {
            const chargeResult = await this.iuguService.charge(chargeRaceRequest.userIuguId, chargeRaceRequest.chargeInfo);

            if (!chargeResult.success) {
                await this.firebaseService.updateRace('parent', chargeRaceRequest.userFirebaseId, chargeRaceRequest.raceKey, {
                    pay: { statusId: 5, status: 'Reserva não autorizada', driverProfit: chargeRaceRequest.driverProfit, amount: chargeRaceRequest.chargeInfo.price },
                });
                return response.status(400).json({ message: 'Reserva não autorizada!', err: chargeResult.errors });
            }

            const drivers = await this.firebaseService.getDriversAvailableToRace();
            const tokens = this.resolveManyUsersTokens(drivers);

            const payload = {
                amount: chargeRaceRequest.driverProfit,
                uid: chargeRaceRequest.userFirebaseId,
                key: chargeRaceRequest.raceKey,
            };

            await this.firebaseService.updateRace(chargeRaceRequest.userFirebaseId, 'parent', chargeRaceRequest.raceKey, {
                pay: { statusId: 30, status: 'Aguardando mãetorista', driverProfit: chargeRaceRequest.driverProfit, amount: chargeRaceRequest.chargeInfo.price, invoice_id: chargeResult.invoice_id },
            });
            await this.fcmService.sendNotification({ tokens, data: payload, notificationMessage: 'Toque aqui para mais detalhes', notificationTitle: 'Nova Korrida disponivel!' });
            return response.status(200).json({ message: 'ok' });
        } catch (err) {
            return response.status(500).json({ message: 'Erro ao no processo de reserva/nova Korrida', err });
        }
    }

    @Post('searchDriver')
    async searchDriver(@Res() response: Response, @Body() body: any): Promise<any> {
        try {
            const payload = {
                amount: body.driverProfit,
                uid: body.parentUid,
                key: body.raceKey,
            };
    
            const drivers = await this.firebaseService.getDriversAvailableToRace();
            const tokens = this.resolveManyUsersTokens(drivers);
    
            await this.fcmService.sendNotification({ tokens, data: payload, notificationMessage: 'Toque aqui para mais detalhes', notificationTitle: 'Nova Korrida disponivel!' });
            return response.status(200).json({ message: 'ok' });   
        }
        catch(err) {
            return response.status(500).json({ message: 'Erro ao no processo de busca de mãetorista', err });
        }
    }   

    @Post('acceptRace')
    async acceptRace(@Res() response: Response, @Body() acceptRace: AcceptRace): Promise<any> {
        try {
            const raceBase = await this.firebaseService.getRaceByKeyAndUserId('parent', acceptRace.parentId, acceptRace.raceKey);
            if (raceBase.pay.statusId === 40) return response.status(400).json({ message: 'Infelizmente outra mãetorista aceitou essa Korrida antes que você', raceAlreadyAccepted: true });

            const paymentResult = await this.iuguService.capture(raceBase.pay.invoice_id);
            const parent = await this.firebaseService.getUserById(acceptRace.parentId);
            const payBody = raceBase.pay;
            const invoice_id = payBody.invoice_id;

            if (!paymentResult.success) {
                payBody.statusId = 5;
                payBody.status = 'Captura de pagamento não autorizada';
                await this.iuguService.cancelInvoice(invoice_id);
                await this.firebaseService.updateRace(acceptRace.parentId, 'parent', acceptRace.raceKey, { pay: payBody });

                if (parent.tokens)
                    await this.fcmService.sendNotification({
                        tokens: this.resolveUserToken(parent),
                        data: { raceKey: acceptRace.raceKey, error: 'Pagamento não autorizado' },
                        notificationTitle: raceBase.raceName,
                        notificationMessage: 'Pagamento não autorizado!',
                    });

                return response.status(403).json({ message: 'Pagamento da Korrida não autorizado', err: paymentResult.errors });
            }

            raceBase.pay.amount = raceBase.pay.driverProfit;
            raceBase.pay.statusId = 40;
            raceBase.pay.uidDriver = acceptRace.driverId;
            raceBase.uidMother = acceptRace.parentId;
            await this.firebaseService.addNewRace('driver', acceptRace.raceKey, acceptRace.driverId, raceBase);

            payBody.uidDriver = acceptRace.driverId;
            payBody.statusId = 40;
            payBody.status = 'Mãetorista selecionada, aguardando o momento da Korrida';

            await this.firebaseService.updateRace(acceptRace.parentId, 'parent', acceptRace.raceKey, { pay: payBody });

            if (parent.tokens)
                await this.fcmService.sendNotification({
                    tokens: this.resolveUserToken(parent),
                    data: { raceKey: acceptRace.raceKey },
                    notificationTitle: raceBase.raceName,
                    notificationMessage: 'Encontramos uma mãetorista para sua Korrida!',
                });

            return response.status(200).json({ message: 'ok' });
        } catch (err) {
            console.log(err);
            return response.status(500).json({ message: 'Erro ao no processo de aceitar a Korrida', err });
        }
    }

    @Post('cancelRace')
    async cancelRace(@Res() response: Response, @Body() cancelRace: CancelRace): Promise<any> {
        try {
            const race = await this.firebaseService.getRaceByKeyAndUserId('parent', cancelRace.userId, cancelRace.raceKey);
            const payBody = race.pay;
            const invoice_id = payBody.invoice_id;

            if (payBody.statusId === 40) return response.status(400).json({ message: 'Korrida já possui uma mãetorista' });

            payBody.statusId = 5;
            payBody.status = 'Cancelada';

            const cancelInvoiceResult = await this.iuguService.cancelInvoice(invoice_id);

            if (!cancelInvoiceResult.success) return response.status(400).json({ message: 'Erro ao cancelar a reserva', err: cancelInvoiceResult.errors });

            await this.firebaseService.updateRace(cancelRace.userId, 'parent', cancelRace.raceKey, { pay: payBody });
            return response.status(200).json({ message: 'Korrida cancelada' });
        } catch (err) {
            return response.status(400).json({ message: 'Erro ao cancelar a korrida', err });
        }
    }

    @Post('finishRace')
    async finishRace(@Res() response: Response, @Body() body: any): Promise<any> {
        try {
            const raceKey = body.raceId;
            const parentUid = body.parentId;
            const driverUid = body.driverId;
    
            this.firebaseService.updateRace(parentUid,'parent', raceKey, {raceStatusId: 2});
            this.firebaseService.updateRace(driverUid,'driver', raceKey, {raceStatusId: 2});
    
            const race = await this.firebaseService.getRaceByKeyAndUserId('driver', driverUid, raceKey);
    
            const driverAmount = race.pay.amount;
            const invoiceId = race.pay.invoice_id;
    
            const driver = await this.driverRepository.findOne({ where: { firebaseUid : driverUid }});
    
            await this.walletService.newEntry(driver.walletUuid, new Date(), invoiceId, driverAmount, raceKey);
            return response.status(200).json({ message: 'ok' });
        }
        catch(err) {
            return response.status(500).json({ message: 'Erro ao finalizar a Korrida', err });
        }
    }


    @Post('createDriver') 
    async createDriver(@Res() response: Response, @Body() body: any): Promise<any> {
        try {
            const driver: Driver = body.driver;
            const bankData: BankData = body.bankData;
            const address: Address = body.address;
    
            const bankDataSaved = await this.bankDataRepository.save(bankData);
            const addressSaved = await this.addressRepository.save(address);
    
            driver.addressUuid = await addressSaved.uuid;
            driver.bankDataUuid = await bankDataSaved.uuid;
    
            const driverSaved = await this.driverRepository.save(driver);
    
            const wallet = await this.walletService.createWallet();
    
            driverSaved.walletUuid = wallet.uuid;
    
            await this.driverRepository.save(driverSaved);
            
            return response.status(200).json({ message: 'Ok', driverUuid: driverSaved.uuid });
        }
        catch(err) {
            return response.status(400).json({ message: 'Erro ao criar a mãetorista', err });
        }
       
    }

    private resolveManyUsersTokens(users: Array<any>): Array<string> {
        const tokens = new Array<string>();

        for (let i = 0; i < users.length; i++) {
            if (users[i].tokens) tokens.push(this.resolveUserToken(users[i]));
        }
        return tokens;
    }

    private resolveUserToken(user: any): string {
        return Object.entries(user.tokens)[0][0];
    }
}
