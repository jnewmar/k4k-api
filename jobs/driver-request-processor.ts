/*
ts-node jobs/driver-request-processor.ts
*/

//const amqp = require('amqplib')
import * as amqp from "amqplib"
import { ConfigService } from '../src/config/config.service';
import { RaceService } from '../src/components/race/race.service';
import { FirebaseService } from '../src/components/firebase/firebase.service';
import { UserService } from '../src/components/user/user.service';
import { IuguService } from '../src/components/payment-gateway/iugu/iugu.service';
import * as request from 'request-promise';

let config = new ConfigService();
const justWill=false;

const raabitmqSettings = {
    protocol: 'amqp',
    hostname:  config.get('RMQ_HOST'),
    port: config.get('RMQ_PORT'),
    username: config.get('RMQ_USER'),
    password: config.get('RMQ_PASSWORD'),
    vhost: '/',
    authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL']
};
const notification_sender_url = config.get('FB_notification_function');

const notificationTitle = 'Proposta de korrida';
const notificationBody = 'Você recebeu uma proposta de korrida';

console.log(raabitmqSettings);

async function getRequestDriver(){

    const conn = await amqp.connect(raabitmqSettings); 
    const ch = await conn.createChannel();
    var q = 'k4k-driver-request';
    ch.assertQueue(q, { durable: false });
    ch.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, processResquestDriver, { noAck: true });
}


async function sendProposalNotification(notificationConf:object){

    /*
    const conn = await amqp.connect(this.raabitmqSettings); 
    const ch = await conn.createChannel();
    var q = 'k4k-proposal-notification';
    var msg = JSON.stringify(notificationConf);
    ch.assertQueue(q, { durable: false });
    ch.sendToQueue(q, new Buffer(msg));
    //console.log(" [x] Sent %s", msg);
    //await conn.close();

    let payload = notificationConf;
    
    return payload;
    */
   let options = {};
    options['uri'] = notification_sender_url;
    options['method'] = 'POST';
    options['body'] = notificationConf
    options['json']=true;

    console.log('options');
    console.log(options);
    let payload = {};
    try {
        payload = await request(options);
        payload['success'] = true;
    }
    catch(err) {
        payload['errors'] = err.error;
        payload['success'] = false;

    }
    return payload;
}

async function processResquestDriver(msg) {
    //console.log(" [x] Received %s", msg.content.toString());
    const dr = JSON.parse(msg.content);
    //console.log(typeof msg.content);
    console.log(dr);
/*
equestDriverConf
{ race_id: '-Lu9hpv8-VifUvdTENGG',
  city: 
   { end: 
      { lat: -23.5174712,
        lng: -46.1914745,
        name: 'Avenida Francisco Rodrigues Filho - Vila Mogilar, Mogi das Cruzes - SP, Brasil' },
     start: 
      { lat: -23.506678,
        lng: -46.1493316,
        name: 'Av. Ricieri José Marcatto, Mogi das Cruzes - SP, Brasil' } },
  test: 1,
  car_seat: 1,
  lift_seat: 0,
  race_type: 'single',
  mother_id: 'CzD4aZYAJMSdZWGsMuNf0GAdTvx1',
  race_date: '2019/12/12',
  race_duration: 
   { maxText: '18 minutos',
     maxValue: 1056000,
     minText: '11 minutos',
     minValue: 661000 },
  race_end_hour: '18:00:00',
  raceEnd: '2019-09-16T21:00:00.000Z',
  raceStart: '2019-09-16T20:42:24.000Z',
  raceEndTimestamp: 1568667600,
  raceStartTimestamp: 1568666544,
  end: { year: 2019, month: 9, day: 16, hour: 18, minute: 0 },
  start: { year: 2019, month: 9, day: 16, hour: 17, minute: 42 },
  request_time: '2020-03-03T22:29:36.637Z' }

*/
    const firebaseService = new FirebaseService(config);
    const raceService = new RaceService(config, firebaseService);
    const paymentService = new IuguService(config);
    const userService = new UserService(config, firebaseService);

    const race_id = dr['race_id'];
    const mother_id = dr['mother_id'];
    const raceInfo = await firebaseService.getRace(race_id);
    console.log('raceInfo');
    console.log(raceInfo);
    /*
    Example of raceInfo
    { adress: 
   { end: 
      { lat: -23.5174712,
        lng: -46.1914745,
        name: 'Avenida Francisco Rodrigues Filho - Vila Mogilar, Mogi das Cruzes - SP, Brasil' },
     start: 
      { lat: -23.506678,
        lng: -46.1493316,
        name: 'Av. Ricieri José Marcatto, Mogi das Cruzes - SP, Brasil' } },
  details: '',
  distance: '5.0',
  kids: { '0': { uid: '-LoELa6nRj6bCZXnk-Py' } },
  lastUpdate: 1568298745218,
  mother_uid: 'CzD4aZYAJMSdZWGsMuNf0GAdTvx1',
  payment: 
   { LR: '00',
     invoice_id: 'C151965752D74B80B4E6500E6CE7C4B5',
     message: 'Autorizado',
     pdf: 'https://faturas.iugu.com/c1519657-52d7-4b80-b4e6-500e6ce7c4b5-f7ea.pdf',
     success: true,
     url: 'https://faturas.iugu.com/c1519657-52d7-4b80-b4e6-500e6ce7c4b5-f7ea' },
  raceDate: '2019/12/12',
  raceDuration: 
   { maxText: '18 minutos',
     maxValue: 1056000,
     minText: '11 minutos',
     minValue: 661000 },
  raceEndHour: '18:00:00',
  raceEndTimestamp: 1568667600000,
  raceMonthly: { '0': { hour: '13:00', weekday: 1 } },
  raceMonthlyChild: true,
  raceName: 'teste',
  raceStatus: 'Aguardando Motorista',
  raceStatusID: 0,
  raceType: 'single',
  receivedKid: false,
  uidMother: 'CzD4aZYAJMSdZWGsMuNf0GAdTvx1' }
    */

    const motherInfo = await firebaseService.getUser(mother_id);
    console.log('paymentMethod');
    console.log(motherInfo['private']['paymentMethod']);
    let resReserve:any;

    if (motherInfo['private']['paymentMethod']['userId'] == undefined || motherInfo['private']['paymentMethod']['paymentMethodId'] == undefined) {
        //no payment method
        resReserve['success'] = false;
        resReserve['errors'] = ['no-payment-method-found'];
    } else {
        let motherIdInPM = motherInfo['private']['paymentMethod']['userId'];

        const reserveInfo = {};
        reserveInfo['userIdInPM'] = motherIdInPM;
        reserveInfo['paymentMethodId'] = motherInfo['private']['paymentMethod']['paymentMethodId'];
        reserveInfo['price'] = 100;
        reserveInfo['description'] = 'Cobrança referente a corrida de ' + raceInfo['raceDate'];
        resReserve = await userService.reserve(reserveInfo, paymentService);
    }
    console.log('resReserve');
    console.log(resReserve);
    await firebaseService.setRacePaymentInfo(race_id, resReserve);



    let availableDriversInfo = await raceService.getPossibleDrivers(dr);
    console.log('availableDriversInfo');
    let availableDrivers = availableDriversInfo['data'];
    console.log(availableDrivers);

    if (justWill) {
        let willdriver = {
            id: 'bQFN709h0YahO3NhLKMW5EGiwQg1',
            name: 'will driver',
            city: 'são paulo',
            car_seat: 1,
            lift_seat: 1,
            test: 1 };
        availableDrivers = [];
        availableDrivers.push(willdriver);
        console.log(availableDrivers);
    }

    for (let index = 0; index < availableDrivers.length; index++) {
        const driver = availableDrivers[index];
        dr['driver_id'] = driver['id'];
        const proposalId = await raceService.createProposal(driver['id'], dr);
        console.log('createProposal');
        console.log('driver id' + driver['id']);
        console.log(proposalId);

        let notificationConf = {
            uid : driver['id'],
            title: notificationTitle,
            body : notificationBody,
            chave: Math.floor(+new Date() / 1000)
        }
        const resSendNot  = await sendProposalNotification(notificationConf);
        console.log(resSendNot);
    }

}
getRequestDriver();