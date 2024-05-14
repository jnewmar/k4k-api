import { Injectable } from '@nestjs/common';
import { createPool, PoolOptions, Pool } from 'mysql2';
import { ConfigService } from '../../services/config/config.service';

@Injectable()
export class UserService {
    private connection: Pool;

    constructor(private readonly config: ConfigService) {
        this.startMySqlPool();
    }

    private startMySqlPool(): void {
        const poolOptions: PoolOptions = {
            host: this.config.environment.MySQL.host,
            port: this.config.environment.MySQL.port,
            user: this.config.environment.MySQL.username,
            password: this.config.environment.MySQL.password,
            database: this.config.environment.MySQL.database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        };

        this.connection = createPool(poolOptions);
    }

    async reserve(reserveInfo: object, paymentService: any) {
        console.log('reserveInfo');
        console.log(reserveInfo);
        let payload = {};
        let chargeInfo = {};

        chargeInfo['method_id'] = reserveInfo['paymentMethodId'];
        chargeInfo['price'] = reserveInfo['price'];
        chargeInfo['description'] = reserveInfo['description'];
        chargeInfo['no_capture'] = true;

        const res = await paymentService.charge(reserveInfo['userIdInPM'], chargeInfo);

        return res;
    }

    async capture(invoice_id: number, paymentService: any) {
        console.log(invoice_id);
        console.log(typeof invoice_id);

        const res = await paymentService.capture(invoice_id);
        console.log(res);
        return res;
    }

    async setDriverSchedule(driverUdid: string, raceId: string, scheduleInfo: object) {
        let sql = '';
        sql += 'INSERT INTO k4k.driver_schedule';
        sql += ' SET ';
        sql += "race_id ='" + raceId + "',";
        sql += "driver_id = '" + driverUdid + "',";
        sql += 'start_timestamp = ' + scheduleInfo['raceStartTimestamp'] + ',';
        sql += 'start_reserved_timestamp = ' + scheduleInfo['raceStartWithReservedTimestamp'] + ',';
        sql += 'end_timestamp = ' + scheduleInfo['raceEndTimestamp'] + '';

        console.log('sql');
        console.log(sql);
        let payload = {};
        try {
            const res = await this.connection.query(sql);
            console.log(res);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async setDriverSlot(driverUdid: string, raceId: string, scheduleInfo: object) {
        let sql = '';
        sql += 'INSERT INTO k4k.driver_slot';
        sql += ' SET ';
        sql += "race_id ='" + raceId + "',";
        sql += "driver_id = '" + driverUdid + "',";
        sql += 'year = ? ,';
        sql += 'month = ? ,';
        sql += 'day = ? ,';
        sql += 'hour = ? ,';
        sql += 'minute = ? ,';
        sql += 'reserved = ? ';

        console.log('scheduleInfo');
        console.log(scheduleInfo);

        console.log('sql');
        console.log(sql);
        let payload = {};
        try {
            let res;
            scheduleInfo['slots'].forEach((slot) => {
                console.log(slot);
                this.connection.execute(sql, slot);
            });

            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}
