import { Injectable } from '@nestjs/common';
import { Transporter, createTransport, SendMailOptions, TransportOptions } from 'nodemailer';
import { ConfigService } from '../config/config.service';
import EmailOptions from './interfaces/email-options.interface';

@Injectable()
export class EmailDispatcherService {
    private transporter: Transporter;

    constructor(private readonly config: ConfigService) {
        this.transporter = createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: this.config.environment.Nodemailer.type,
                user: this.config.environment.Nodemailer.user,
                serviceClient: this.config.environment.Nodemailer.service_client,
                privateKey: this.config.environment.Nodemailer.private_key,
            },
        } as TransportOptions);
    }

    public sendEmail(emailOptions: EmailOptions): Promise<any> {
        const options: SendMailOptions = {
            from: this.config.environment.Nodemailer.user,
            to: emailOptions.to,
            subject: emailOptions.subject,
            text: emailOptions.text,
            html: emailOptions.html,
        };

        return new Promise(async (resolve, reject) => {
            try {
                await this.transporter.verify();
                const res = await this.transporter.sendMail(options);
                return resolve(res);
            } catch (err) {
                return reject(err);
            }
        });
    }
}
