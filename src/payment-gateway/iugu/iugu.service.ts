import { Injectable } from '@nestjs/common';
import * as request from 'request-promise';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class IuguService {
    private apiToken: string;
    private password: string;
    private urlBase: string;
    private auth: string;
    private optionsTemplate: object;

    constructor(config: ConfigService) {
        (this.apiToken = config.get('IUGU_apiToken')),
            (this.password = config.get('IUGU_password')),
            (this.urlBase = config.get('IUGU_urlBase')),
            (this.auth = 'Basic ' + Buffer.from(this.apiToken + ':' + this.password).toString('base64')); 
        this.optionsTemplate = {
            url: this.urlBase,
            json: true,
            headers: {
                Authorization: this.auth,
            },
        };
    }

    async getUsers() {
        let options = this.optionsTemplate;
        options['url'] = this.urlBase + 'customers';
        options['method'] = 'GET';
        return await request(options);
    }

    async getUser(id: string) {
        let options = this.optionsTemplate;
        options['url'] = this.urlBase + 'customers/' + id;
        options['method'] = 'GET';
        return await request(options);
    }

    async createUser(user: object) {
        let options = this.optionsTemplate;
        options['url'] = this.urlBase + 'customers';
        options['method'] = 'POST';
        options['body'] = user;
        return await request(options);
    }

    async getPaymemtMethod(userId: string) {
        let options = this.optionsTemplate;
        //https://api.iugu.com/v1/customers/customer_id/payment_methods
        options['url'] = this.urlBase + 'customers/' + userId + '/payment_methods';
        options['method'] = 'GET';
        options['body'] = {};
        options['body']['customer_id'] = userId;
        console.log('options');
        console.log(options);
        let payload = {};
        try {
            payload = await request(options);
            payload['success'] = true;
        } catch (err) {
            payload['errors'] = err.error;
            payload['success'] = false;
        }
        return payload;
    }

    async createPaymemtMethodUsingToken(userId: string, token: string) {
        console.log('userId');
        console.log(userId);
        console.log('token');
        console.log(token);

        let options_pm = this.optionsTemplate;
        options_pm['url'] = this.urlBase + 'customers/' + userId + '/payment_methods';
        options_pm['method'] = 'POST';
        options_pm['body'] = {};
        options_pm['body']['customer_id'] = userId;
        options_pm['body']['description'] = 'Default card';
        options_pm['body']['token'] = token;
        options_pm['body']['set_as_default'] = true;

        console.log(options_pm);
        let paymentMethodInfo = await request(options_pm);
        console.log('paymentMethodInfo');
        console.log(paymentMethodInfo);

        let ret: object = {
            userId: userId,
            token: token,
            paymentMethodId: paymentMethodInfo['id'],
            type: 'IUGU',
        };
        return ret;
    }

    async createPaymemtMethod(userId: string, paymentInfo: object) {
        console.log('userId');
        console.log(userId);
        console.log('paymentInfo');
        console.log(paymentInfo);

        let options = this.optionsTemplate;
        options['url'] = this.urlBase + 'payment_token';
        options['method'] = 'POST';
        options['body'] = {};
        options['body']['account_id'] = this.apiToken;
        options['body']['test'] = true;
        options['body']['method'] = 'credit_card';
        options['body']['data'] = paymentInfo;
        let tokenInfo = await request(options);
        console.log('tokenInfo');
        console.log(tokenInfo);

        let options_pm = this.optionsTemplate;
        options_pm['url'] = this.urlBase + 'customers/' + userId + '/payment_methods';
        options_pm['method'] = 'POST';
        options_pm['body'] = {};
        options_pm['body']['customer_id'] = userId;
        options_pm['body']['description'] = 'Default card';
        options_pm['body']['token'] = tokenInfo['id'];
        options_pm['body']['set_as_default'] = true;

        console.log(options_pm);
        let paymentMethodInfo = await request(options_pm);
        console.log('paymentMethodInfo');
        console.log(paymentMethodInfo);

        let ret: object = {
            userId: userId,
            token: tokenInfo['id'],
            paymentMethodId: paymentMethodInfo['id'],
            type: 'IUGU',
        };
        return ret;
    }
    async createToken(paymentInfo: object) {
        console.log('paymentInfo');
        console.log(paymentInfo);

        let options = this.optionsTemplate;
        options['url'] = this.urlBase + 'payment_token';
        options['method'] = 'POST';
        options['body'] = {};
        options['body']['account_id'] = this.apiToken;
        options['body']['test'] = true;
        options['body']['method'] = 'credit_card';
        options['body']['data'] = paymentInfo;
        let tokenInfo = await request(options);
        console.log('tokenInfo');
        console.log(tokenInfo);
        return tokenInfo['id'];
    }

    async charge(userId: string, chargeInfo: object) {
        let options = this.optionsTemplate;
        options['url'] = this.urlBase + 'charge';
        options['method'] = 'POST';
        options['body'] = {};
        options['body']['customer_payment_method_id'] = chargeInfo['method_id'];
        options['body']['restrict_payment_method'] = false;
        options['body']['customer_id'] = userId;
        options['body']['items'] = {
            description: chargeInfo['description'],
            quantity: 1,
            price_cents: chargeInfo['price'],
        };

        //options['body']['order_id'] = 1;
        console.log(options);
        let payload = {};
        try {
            payload = await request(options);
            payload['success'] = true;
            if (chargeInfo['no_capture'] == undefined || chargeInfo['no_captureno_capture'] == false) {
                payload['capture_info'] = await this.capture(payload['invoice_id']);
            }
        } catch (err) {
            payload['errors'] = err.error;
            payload['success'] = false;
        }

        return payload;
    }

    async capture(invoice_id: number) {
        console.log('invoice_id');
        console.log(invoice_id);
        let options = this.optionsTemplate;
        options['url'] = this.urlBase + 'invoices/' + invoice_id + '/capture';
        options['method'] = 'POST';
        options['body'] = {};
        options['body']['id'] = invoice_id;

        console.log(options);
        let payload = {};
        try {
            payload = await request(options);
            payload['success'] = true;
        } catch (err) {
            payload['errors'] = err.error;
            payload['success'] = false;
        }
        console.log('capture');
        console.log(payload);
        return payload;
    }
}
