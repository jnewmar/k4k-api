import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RaceService {
    private connection: any;

    constructor(config: ConfigService) {
        let dbConfig = {
            host: config.get('MYSQL_HOST'),
            port: config.get('MYSQL_PORT'),
            user: config.get('MYSQL_USERNAME'),
            password: config.get('MYSQL_PASSWORD'),
            database: config.get('MYSQL_DATABASE'),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        };
        //console.log(dbConfig);
        this.connection = mysql.createPool(dbConfig);
    }

    async getPossibleDrivers() {
        let sql = 'SELECT * FROM k4k.available_drivers';
        let payload = {};
        try {
            const [rows, fields] = await this.connection.query(sql);
            //console.log(rows, fields);
            payload['data'] = rows;
            payload['success'] = true;
        } catch (err) {
            console.log(err);
            payload['errors'] = err;
            payload['success'] = false;
        }
        //console.log('acabou');
        return payload;
    }
}
