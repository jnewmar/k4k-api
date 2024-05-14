import { Controller, Post, Body, Req } from '@nestjs/common';
import { IuguService } from '../payment-gateway/iugu/iugu.service';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('users')
export class UserController {
    constructor(private paymentService: IuguService, private firebaseService: FirebaseService) {}

    /*@Post('create-user-in-payment-method')
    createUser(@Body() user: object): object{
        console.log(user);
        console.log(typeof user);
        let payload = this.paymentService.createUser(user);
        return payload;
    }
*/
    @Post('get-payment-method')
    async getUsers(@Req() req: any) {
        console.log('req.authId');
        console.log(req.authId);
        const user = await this.firebaseService.getUser(req.authId);
        console.log('paymentMethod');
        console.log(user['private']['paymentMethod']);

        let payload = {};
        if (user['private']['paymentMethod']['userId'] == undefined || user['private']['paymentMethod']['paymentMethodId'] == undefined) {
            payload['success'] = false;
            payload['errors'] = ['no-payment-method-found'];
        } else {
            payload = user['private']['paymentMethod'];
            const paymemtMethodInfo = await this.paymentService.getPaymemtMethod(user['private']['paymentMethod']['userId']);
            console.log(paymemtMethodInfo);
            if (paymemtMethodInfo['success'] == true) {
                payload['success'] = true;
                payload['data'] = paymemtMethodInfo[0]['data'];
            } else {
                payload = {};
                payload['success'] = false;
                payload['errors'] = [paymemtMethodInfo['errors']['errors']];
            }
        }
        return payload;
    }

    @Post('create-token')
    async createToken(@Body() paymentInfo: any) {
        return await this.paymentService.createToken(paymentInfo);
    }

    @Post('create-payment-method')
    async createPaymemtMethodUsingToken(@Body() tokenInfo: any, @Req() req: any) {
        console.log('tokenInfo');
        console.log(tokenInfo);
        console.log('req.authId');
        console.log(req.authId);
        const user = await this.firebaseService.getUser(req.authId);
        console.log('paymentMethod');
        console.log(user['private']['paymentMethod']);

        let userIdInPM: string;
        if (user['private']['paymentMethod'] == undefined) {
            console.log('entrou');
            let PMUserObj: object = {
                name: user['private']['name'],
                email: user['private']['email'],
                custom_variables: [
                    {
                        name: 'k4k4_id',
                        value: req.authId,
                    },
                ],
            };

            console.log(PMUserObj);
            let userInfoInPM = await this.paymentService.createUser(PMUserObj);
            userIdInPM = userInfoInPM['id'];
            console.log('userIdInPM');
            console.log(userIdInPM);
        } else {
            userIdInPM = user['private']['paymentMethod']['userId'];
        }

        let paymemtMethodInfo = await this.paymentService.createPaymemtMethodUsingToken(userIdInPM, tokenInfo['token']);
        console.log('paymemtMethodInfo');
        console.log(paymemtMethodInfo);

        await this.firebaseService.setPaymentMethodInfo(req.authId, paymemtMethodInfo);

        const userAfter = await this.firebaseService.getUser(req.authId);
        console.log('userAfter');
        console.log(userAfter['private']['paymentMethod']);

        return userAfter['private']['paymentMethod'];
    }

    @Post('charge')
    async charge(@Body() body: any, @Req() req: any) {
        console.log(body);
        console.log(typeof body);
        console.log('req.authId');
        console.log(req.authId);
        const user = await this.firebaseService.getUser(req.authId);
        console.log('paymentMethod');
        console.log(user['private']['paymentMethod']);

        let payload = {};
        let chargeInfo = {};
        let userIdInPM = user['private']['paymentMethod']['userId'];
        if (user['private']['paymentMethod']['userId'] == undefined || user['private']['paymentMethod']['paymentMethodId'] == undefined) {
            payload['success'] = false;
            payload['errors'] = ['no-payment-method-found'];
        } else {
            chargeInfo['method_id'] = user['private']['paymentMethod']['paymentMethodId'];
            chargeInfo['price'] = body['price'];
            chargeInfo['description'] = body['description'];
            chargeInfo['no_capture'] = body['no_capture'];
            payload = await this.paymentService.charge(userIdInPM, chargeInfo);
        }
        return payload;
    }

    @Post('capture')
    async capture(@Body() body: any, @Req() req: any) {
        console.log(body);
        console.log(typeof body);
        console.log('req.authId');
        console.log(req.authId);
        const user = await this.firebaseService.getUser(req.authId);
        let payload = {};
        payload = await this.paymentService.capture(body['invoice_id']);
        console.log(payload);
        return payload;
    }

    @Post('race/charge')
    async raceCharge(@Body() body: any, @Req() req: any) {
        console.log(body);
        console.log(typeof body);
        const loggedUserd = req.authId;
        console.log('loggedUserd');
        console.log(loggedUserd);
        //const user = await this.firebaseService.getUser(req.authId);

        const raceInfo = await this.firebaseService.getRace(body['race_id']);
        console.log('raceInfo');
        console.log(raceInfo);

        let payload = {};
        if (raceInfo['uidMother'] != loggedUserd) {
            payload['success'] = false;
            payload['errors'] = ['no-payment-method-found'];
        } else {
            payload = await this.charge(body, req);
        }
        await this.firebaseService.setRacePaymentInfo(body['race_id'], payload);

        return payload;
    }
}
