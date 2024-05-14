import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
    private db: admin.database.Database;
    private auth: admin.auth.Auth;

    constructor() {
        this.db = admin.database();
        this.auth = admin.auth();
    }

    saveEskolareOrder(status:string ,order:any): Promise<any> {
        return new Promise((resolve,reject) => {
            try {
              const res = this.db.ref(`/EskolareOrders/${status}`).push(order);
                return resolve(res);
            }
            catch(err) {
                return reject(err)
            }
        });
    }

    async createUser(userBody: any): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await this.auth.createUser({email: userBody.private.email,password: '123kar4kids'});
                await this.db.ref(`/Users/${user.uid}`).set(userBody);
                return resolve(user.uid);
            }
            catch(err) {
                reject(err);
            }
        });
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

    async getUserByRegistry(registry: string) {
        const ref = this.db.ref('/Users').orderByChild('private/cpf').equalTo(registry);
        const res = await ref.once('value');
        return res.toJSON();
    }

    async getKid(id: string) {
        console.log(id);
        let ref = this.db.ref('/Kids/' + id);
        let res = await ref.once('value');
        console.log(res);
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
                    lat: -23.5116492,
                    lng: -46.18766270000003,
                    name: 'Av. Cívica, Mogi das Cruzes - SP, Brasil',
                },
                start: {
                    lat: -23.5156605,
                    lng: -46.169683899999995,
                    name: 'Av. João XXIII - Socorro, Mogi das Cruzes - SP, Brasil',
                },
            },
            backRace: false,
            details: 'Nenhuma ',
            distance: 2,
            kids: [
                {
                    uid: '-Lu7NxX5MKowJj-g8DFQ',
                },
            ],
            lastUpdate: 1574562371801,
            pay: {
                amount: 14.27,
                lastUpdate: 1574562373281,
                order: -1574562359000,
                status: 'Aguardando Pagamento',
                statusId: 10,
                token: '87dba9b23a351845e4906f522ad86a36',
            },
            raceBackDuration: {
                maxText: 0,
                maxValue: 0,
                minText: 0,
                minValue: 0,
            },
            raceBackTimestamp: 0,
            raceDate: '2019/11/24',
            raceDuration: {
                maxText: '8 minutos',
                maxValue: 472000,
                minText: '6 minutos',
                minValue: 362000,
            },
            raceEndHour: '19:30',
            raceEndTimestamp: 0,
            raceName: 'Teste',
            raceStatus: 'Aguardando Motorista',
            raceStatusID: 0,
            raceType: 'single',
            receivedKid: false,
        });
        /*
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
            "raceEndHour" : "18:00:00",
            "raceEndTimestamp" : 1568667600000,
            "raceMonthly" : [ {
              "hour" : "13:00",
              "weekday" : 1
            } ],
            "raceMonthlyChild" : true,
            "raceName" : "teste",
            "raceStatus" : "Aguardando Motorista",
            "raceStatusID" : 0,
            "raceType" : "single",
            "receivedKid" : false,
            "uidMother" : "G6MFP9HJfcNHtv9GcsxvN6Ul6XF3"
          });
         */
    }

    async getRace(id: string) {
        let ref = this.db.ref('/Race/' + id);
        let res = await ref.once('value');
        // console.log(res);
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

    async addProposal(udid: string, proposalConf: object) {
        let ref = this.db.ref('/Proposal/').child(udid);
        let newProposalRef = ref.push();
        await newProposalRef.set(proposalConf);
        return await newProposalRef.key;
    }

    async getUserProposals(udid: string) {
        let ref = this.db.ref('/Proposal/' + udid);
        let res = await ref.once('value');
        console.log(res);
        return res.toJSON();
    }

    async getProposal(udid: string, proposalId: string) {
        let ref = this.db.ref('/Proposal/' + udid + '/' + proposalId);
        let res = await ref.once('value');
        console.log(res);
        return res.toJSON();
    }

    async setProposalStatus(udid: string, proposalId: string, statusInfo: object) {
        let ref = await this.db.ref('/Proposal/' + udid + '/' + proposalId + '/statusInfo').set(statusInfo);
    }

    getUserById(userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db
                .ref(`Users/${userId}`)
                .once('value')
                .then((user: admin.database.DataSnapshot) => resolve(user.val()))
                .catch((err: any) => reject(err));
        });
    }

    addNewRace(from: string, raceKey: string, userId: string, race: any): Promise<admin.database.ThenableReference> {
        return new Promise((resolve, reject) => {
            this.db
                .ref(`${from === 'parent' ? 'ParentKorrida' : 'DriverKorrida'}/${userId}/${raceKey}`)
                .set(race)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    updateRace(userId: string, from: string, raceKey: string, body: any): Promise<void> {
        return this.db.ref(`${from === 'parent' ? 'ParentKorrida' : 'DriverKorrida'}/${userId}/${raceKey}`).update(body);
    }

    getRaceByKeyAndUserId(from: string, userId: string, key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db
                .ref(`${from === 'parent' ? 'ParentKorrida' : 'DriverKorrida'}/${userId}/${key}`)
                .once('value')
                .then((race: admin.database.DataSnapshot) => resolve(race.val()))
                .catch((err: any) => reject(err));
        });
    }

    async getDriversAvailableToRace() {
        const allUsers = (await this.db.ref(`Users`).once('value')).val();
        const allDrivers = new Map(Object.entries(allUsers));
        const availableDrivers = [];

        allDrivers.forEach((driver: any) => {
            if (driver.private && driver.private.userType === 'driver' && driver.tokens && driver.private.userStatus === 'active' && driver.private.availability) availableDrivers.push(driver);
        });

        return availableDrivers;
    }

    async removeUserPaymentMethod(userId: string): Promise<void> {
        return this.db.ref(`Users/${userId}/paymentMethod/paymentMethodId`).remove();
    }
}
