/*
ts-node jobs/driver-assignment-processor.ts

DONE

 - expire proposal of the other users
  - add race to the driver calendar (mysql)
 - send notification to the mother (call firebase function)

TODO


 - capture charge (iugu)
 
CREATE TABLE `driver_schedule` (
  `driver_id` char(45) NOT NULL,
  `race_id` char(45) NOT NULL,
  `start_reserved_timestamp` int(11) NOT NULL,
  `start_timestamp` int(11) NOT NULL,
  `end_timestamp` int(11) NOT NULL,
  PRIMARY KEY (`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


NOT USED YET (09-01-2020) -> 
CREATE TABLE `driver_slot` (
  `driver_id` char(45) NOT NULL,
  `race_id` char(45) NOT NULL,
  `year` int(4) NOT NULL DEFAULT '0',
  `month` int(3) NOT NULL DEFAULT '0',
  `day` int(3) NOT NULL DEFAULT '0',
  `hour` int(3) NOT NULL DEFAULT '0',
  `minute` int(3) NOT NULL DEFAULT '0',
  `reserved` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`driver_id`,`year`,`month`,`day`,`hour`,`minute`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

*/


import * as amqp from "src/components/user/node_modules/src/components/race/node_modules/amqplib"
import { ConfigService } from '../src/config/config.service';
import { RaceService } from '../src/components/race/race.service';
import { UserService } from '../src/components/user/user.service';
import { IuguService } from '../src/payment-gateway/iugu/iugu.service';
import { FirebaseService } from '../src/components/firebase/firebase.service';
import * as request from 'request-promise';

let config = new ConfigService();

//TODO - put reservedTimeBeforeRace into the Setting of the system
const reservedTimeBeforeRace = 1000*60*15;

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

const notificationTitle = 'Mãetorista encontrada';
const notificationBody = 'Encontramos uma mãetorista para sua korrida';

console.log(raabitmqSettings);

async function getRequestAssignmentDriverToRace(){

    const conn = await amqp.connect(raabitmqSettings); 
    const ch = await conn.createChannel();
    var q = 'k4k-driver-assignment';
    ch.assertQueue(q, { durable: false });
    ch.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, processAssignmentDriver, { noAck: true });
}

async function sendAssignmentDriverNotification(notificationConf:object){

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

async function processAssignmentDriver(msg) {
    console.log(" [x] Received %s", msg.content.toString());
    const ad = JSON.parse(msg.content);
    console.log(typeof msg.content);
    console.log(ad);
/*
example of AssignmentDriver object
object
{ driver_id: 'bQFN709h0YahO3NhLKMW5EGiwQg1',
  mother_id: 'CzD4aZYAJMSdZWGsMuNf0GAdTvx1',
  race_id: '-Lu9hpv8-VifUvdTENGG',
  proposal_id: '-LwGwwDVbxd4TBSC97qj' }

*/


    const firebaseService = new FirebaseService(config);
    const raceService = new RaceService(config, firebaseService);
    const paymentService = new IuguService(config);
    const userService = new UserService(config, firebaseService);

    const driver_id = ad['driver_id'];
    const proposal_id = ad['proposal_id'];
    const race_id = ad['race_id'];

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

    const invoice_id = raceInfo['payment']['invoice_id']
    const resCapture= userService.capture(invoice_id, paymentService);
    console.log('resCapture');
    console.log(resCapture);

    await raceService.setLostOtherProposals(driver_id, proposal_id);

    const proposalInfo = await raceService.getProposal(proposal_id);
    console.log('proposalInfo');
    console.log(proposalInfo['data']);
    /*
    Example of proposalInfo['data']
    {
        proposal_uid: '-LwGwwDVbxd4TBSC97qj',
        race_uid: '-Lu9hpv8-VifUvdTENGG',
        mother_uid: 'CzD4aZYAJMSdZWGsMuNf0GAdTvx1',
        driver_uid: 'bQFN709h0YahO3NhLKMW5EGiwQg1',
        create_timestamp: 2020-01-09T18:50:35.000Z,
        answser_timestamp: 2020-01-09T18:50:35.000Z,
        status: 'ACCEPTED',
        expired: 0,
        expire_timestamp: null }
    */


    

    const endDate = new Date(raceInfo['raceEndTimestamp']);
    const startDate = new Date(raceInfo['raceEndTimestamp'] - raceInfo['raceDuration']['maxValue']);
    const startDateWithReservedTime = new Date(raceInfo['raceEndTimestamp'] - raceInfo['raceDuration']['maxValue'] - reservedTimeBeforeRace);

    const scheduleInfo = {
        'raceDate':raceInfo['raceDate'],
        'raceEndHour':raceInfo['raceEndHour'],
        'raceEnd':endDate,
        'raceStart':startDate,
        'raceStartWithReserved':startDateWithReservedTime,
        'raceEndTimestamp':Math.floor(endDate.getTime()/1000),
        'raceStartTimestamp':Math.floor(startDate.getTime()/1000),
        'raceStartWithReservedTimestamp':Math.floor(startDateWithReservedTime.getTime()/1000)
        /*,
        'end': {
            'year':endDate.getFullYear(),
            'month':endDate.getMonth()+1,
            'day':endDate.getDate(),
            'hour':endDate.getHours(),
            'minute':endDate.getMinutes(),
        },
        'start': {
            'year':startDate.getFullYear(),
            'month':startDate.getMonth()+1,
            'day':startDate.getDate(),
            'hour':startDate.getHours(),
            'minute':startDate.getMinutes()
        },
        'startWithReserved': {
            'year':startDateWithReservedTime.getFullYear(),
            'month':startDateWithReservedTime.getMonth()+1,
            'day':startDateWithReservedTime.getDate(),
            'hour':startDateWithReservedTime.getHours(),
            'minute':startDateWithReservedTime.getMinutes()
        },*/
    };
    /*
    let count =0;
    let slotTimestamp;
    let slots = [];
    let reserved = 1;
    do {
        slotTimestamp = new Date(startDateWithReservedTime.getTime() + count * 60000);
        if (slotTimestamp.getTime() > startDate.getTime()) {
            reserved = 0;
        }
        slots[count] = [
            slotTimestamp.getFullYear(),
            slotTimestamp.getMonth()+1,
            slotTimestamp.getDate(),
            slotTimestamp.getHours(),
            slotTimestamp.getMinutes(),
            reserved
        ]
        count++;
    } while (slotTimestamp.getTime() <= endDate.getTime())
    scheduleInfo['slots'] = slots;
    */

    console.log('scheduleInfo');
    console.log(scheduleInfo);

    await userService.setDriverSchedule(driver_id, race_id, scheduleInfo);
    //await userService.setDriverSlot(driver_id, race_id, scheduleInfo);

    const receiver_id =  ad['mother_id'];

    //test will
    //const receiver_id = ad['driver_id'];//'G6MFP9HJfcNHtv9GcsxvN6Ul6XF3';;

    let notificationConf = {
        uid : receiver_id,
        title: notificationTitle,
        body : notificationBody,
        chave: Math.floor(+new Date() / 1000)
    };

    const resSendNot  = await sendAssignmentDriverNotification(notificationConf);
    console.log(resSendNot);

}
getRequestAssignmentDriverToRace();