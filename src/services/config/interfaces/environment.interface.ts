import Eskolare from './eskolare.interface';
import MySQL from './mysql.interface';
import Pusher from './pusher.interface';
import FirebaseProjectCredentials from './firebase-project-credentials.interface';
import Iugu from './iugu.interface';
import RMQ from './rabbitmq.interface';
import Nodemailer from './nodemailer.interface';

export default interface Environment {
    MySQL: MySQL;
    FirebaseProjectCredentials: FirebaseProjectCredentials;
    Eskolare: Eskolare;
    Pusher: Pusher;
    Iugu: Iugu;
    RabbitMQ: RMQ;
    Nodemailer: Nodemailer;
}
