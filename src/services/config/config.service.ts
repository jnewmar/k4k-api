import { Injectable } from '@nestjs/common';
import { parse } from 'dotenv-flow';
import Environment from './interfaces/environment.interface';
import MySQL from './interfaces/mysql.interface';
import FirebaseProjectCredentials from './interfaces/firebase-project-credentials.interface';
import Eskolare from './interfaces/eskolare.interface';
import Iugu from './interfaces/iugu.interface';
import Pusher from './interfaces/pusher.interface';
import RabbitMQ from './interfaces/rabbitmq.interface';
import Nodemailer from './interfaces/nodemailer.interface';

@Injectable()
export class ConfigService {
    private _environment: Environment;

    constructor() {
        const nodeEnv = process.env.NODE_ENV || 'development';
        const env = parse('.env.' + nodeEnv);

        this._environment = {
            MySQL: this.MySQL(env),
            FirebaseProjectCredentials: this.FirebaseProjectCredentials(env),
            Eskolare: this.Eskolare(env),
            Iugu: this.Iugu(env),
            Nodemailer: this.Nodemailer(env),
            Pusher: this.Pusher(env),
            RabbitMQ: this.RabbitMQ(env),
        };
    }

    get environment(): Environment {
        return this._environment;
    }

    private MySQL(env: any): MySQL {
        return {
            host: env['MYSQL_HOST'],
            database: env['MYSQL_DATABASE'],
            password: env['MYSQL_PASSWORD'],
            port: env['MYSQL_PORT'],
            synchronize: env['MYSQL_SYNCHRONIZE'],
            username: env['MYSQL_USERNAME'],
        };
    }

    private FirebaseProjectCredentials(env: any): FirebaseProjectCredentials {
        return {
            type: env['FB_type'],
            project_id: env['FB_project_id'],
            private_key_id: env['FB_private_key_id'],
            private_key: String(env['FB_private_key']).replace(/\\n/g, '\n'),
            client_email: env['FB_client_email'],
            client_id: env['FB_client_id'],
            auth_uri: env['FB_auth_uri'],
            token_uri: env['FB_token_uri'],
            auth_provider_x509_cert_url: env['FB_auth_provider_x509_cert_url'],
            client_x509_cert_url: env['FB_client_x509_cert_url'],
            databaseURL: env['FB_databaseURL'],
            notification_function: env['FB_notification_function'],
        };
    }

    private Eskolare(env: any): Eskolare {
        return {
            api_token: env['ESKOLARE_key'],
            urlBase: env['ESKOLARE_urlBase'],
            webhook_access_token: env['ESKOLARE_acess_token'],
        };
    }

    private Iugu(env: any): Iugu {
        return {
            apiToken: env['IUGU_apiToken'],
            password: env['IUGU_password'],
            urlBase: env['IUGU_urlBase'],
        };
    }

    private Pusher(env: any): Pusher {
        return {
            appId: env['PUSHER_appId'],
            cluster: env['PUSHER_cluster'],
            key: env['PUSHER_key'],
            secret: env['PUSHER_secret'],
            useTLS: env['PUSHER_useTLS'],
        };
    }

    private RabbitMQ(env: any): RabbitMQ {
        return {
            host: env['RMQ_HOST'],
            password: env['RMQ_PASSWORD'],
            port: env['RMQ_PORT'],
            user: env['RMQ_USER'],
        };
    }

    private Nodemailer(env: any): Nodemailer {
        return {
            host: env['NODEMAILER_host'],
            port: env['NODEMAILER_port'],
            private_key: env['NODEMAILER_private_key'],
            service_client: env['NODEMAILER_service_client'],
            type: env['NODEMAILER_type'],
            user: env['NODEMAILER_user'],
        };
    }
}
