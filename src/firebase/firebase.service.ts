import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '../config/config.service';

export default admin;

@Injectable()
export class FirebaseService {
    private db: any;
    private serviceAccount: object;
    private databaseURL: string;

    constructor(private config: ConfigService) {
        this.serviceAccount = {
            type: config.get('FB_type'),
            project_id: config.get('FB_project_id'),
            private_key_id: config.get('FB_private_key_id'),
            private_key: config.get('FB_private_key').replace(/\\n/g, '\n'),
            client_email: config.get('FB_client_email'),
            client_id: config.get('FB_client_id'),
            auth_uri: config.get('FB_auth_uri'),
            token_uri: config.get('FB_token_uri'),
            auth_provider_x509_cert_url: config.get('FB_auth_provider_x509_cert_url'),
            client_x509_cert_url: config.get('FB_client_x509_cert_url'),
        };
        //console.log(this.serviceAccount);
        this.databaseURL = config.get('FB_databaseURL');
        try {
            this.db = admin.database();
        } catch (error) {
            admin.initializeApp({
                credential: admin.credential.cert(this.serviceAccount),
                databaseURL: this.databaseURL,
            });
            this.db = admin.database();
        }
    }

    async init() {}

    async getAllUsers() {
        let ref = this.db
            .ref('/Users')
            .orderByChild('lastConect')
            .limitToLast(3);
        return await ref.once('value');
    }

    async getUser(id: string) {
        let ref = this.db.ref('/Users/' + id);
        let res = await ref.once('value');
        return res.toJSON();
    }

    async getParentKorridas(user_id: string) {
        let ref = this.db
            .ref('/ParentKorrida/' + user_id)
            .orderByChild('raceEndTimestamp')
            .limitToLast(3);
        return await ref.once('value');
    }

    async setPaymentMethodInfo(id: string, paymentMethodInfo: object) {
        let ref = await this.db.ref('/Users/' + id + '/private/paymentMethod').set(paymentMethodInfo);
    }

    async getParentRace(user_id: string, race_id: string) {
        let ref = this.db
            .ref('/ParentKorrida/' + user_id)
            .orderByChild('raceEndTimestamp')
            .limitToLast(3);
        return await ref.once('value');
    }

    async addRace() {
        let ref = this.db.ref('/Race/');
        return await ref.push().set({
            adress: {
                end: {
                    lat: -23.5174712,
                    lng: -46.1914745,
                    name: 'Avenida Francisco Rodrigues Filho - Vila Mogilar, Mogi das Cruzes - SP, Brasil',
                },
                start: {
                    lat: -23.506678,
                    lng: -46.1493316,
                    name: 'Av. Ricieri José Marcatto, Mogi das Cruzes - SP, Brasil',
                },
            },
            details: '',
            distance: '5.0',
            kids: [
                {
                    uid: '-Lrq_QYEKXc789LXmcMU',
                },
            ],
            lastUpdate: 1568298745218,
            raceDate: '2019/12/12',
            raceDuration: {
                maxText: '18 minutos',
                maxValue: 1056000,
                minText: '11 minutos',
                minValue: 661000,
            },
            raceEndHour: '18:00:00',
            raceEndTimestamp: 1568667600000,
            raceMonthly: [
                {
                    hour: '13:00',
                    weekday: 1,
                },
            ],
            raceMonthlyChild: true,
            raceName: 'teste',
            raceStatus: 'Aguardando Motorista',
            raceStatusID: 0,
            raceType: 'single',
            receivedKid: false,
            uidMother: 'G6MFP9HJfcNHtv9GcsxvN6Ul6XF3',
        });
    }

    async getRace(id: string) {
        let ref = this.db.ref('/Race/' + id);
        let res = await ref.once('value');
        console.log(res);
        return res.toJSON();
    }

    async setRacePaymentInfo(raceId: string, paymentInfo: object) {
        let ref = this.db.ref('/Race/' + raceId + '/payment/');
        let res = await ref.set(paymentInfo);
    }

    async getPossibleDrivers() {
        let payload = [];
        let ref = this.db
            .ref('/Users/')
            .orderByChild('private/userType')
            .equalTo('driver');
        let res = await ref.once('value');
        console.log(res);
        return res.toJSON();
    }
}
