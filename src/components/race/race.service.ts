import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../services/config/config.service';
import { connect } from 'amqplib';
import { FirebaseService } from '../firebase/firebase.service';
import { Pool, createPool, PoolOptions } from 'mysql2';

@Injectable()
export class RaceService {
    private connection: Pool;
    private raabitmqSettings: any;

    constructor(private readonly config: ConfigService, private readonly firebaseService: FirebaseService) {
        this.startMySqlPool();
        this.startRabbitMQ();
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

    private startRabbitMQ(): void {
        this.raabitmqSettings = {
            protocol: 'amqp',
            hostname: this.config.environment.RabbitMQ.host,
            port: this.config.environment.RabbitMQ.port,
            username: this.config.environment.RabbitMQ.user,
            password: this.config.environment.RabbitMQ.password,
            vhost: '/',
            authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL'],
        };
    }

    async requestDriver(requestDriverConf: object) {
        const conn = await connect(this.raabitmqSettings);
        const ch = await conn.createChannel();
        var q = 'k4k-driver-request';
        var msg = JSON.stringify(requestDriverConf);
        ch.assertQueue(q, { durable: false });
        ch.sendToQueue(q, new Buffer(msg));
        //console.log(" [x] Sent %s", msg);
        //await conn.close();

        let payload = requestDriverConf;

        return payload;
    }

    async getPossibleDrivers(requestDriverConf: object) {
        console.log('requestDriverConf');
        console.log(requestDriverConf);

        // TODO - WHEN THE SYSTEM GET A LOT OF RACES -> OPTIMIZE THIS QUERY
        let sql = 'SELECT ad.* FROM k4k.available_drivers ad where ad.id NOT IN (';
        sql += '  SELECT driver_id FROM k4k.driver_schedule where (';
        sql += '  start_reserved_timestamp <= ' + requestDriverConf['raceStartTimestamp'];
        sql += '  AND end_timestamp >= ' + requestDriverConf['raceStartTimestamp'];
        sql += '  ) OR ( ';
        sql += '  start_reserved_timestamp <= ' + requestDriverConf['raceEndTimestamp'];
        sql += '  AND end_timestamp >= ' + requestDriverConf['raceEndTimestamp'];
        sql += ')) ';

        if (requestDriverConf['test']) {
            sql += ' AND ad.test = 1';
        }
        if (requestDriverConf['car_seat']) {
            sql += ' AND ad.car_seat = 1';
        }
        if (requestDriverConf['lift_seat']) {
            sql += ' AND ad.lift_seat = 1';
        }
        sql += ' LIMIT 20';
        console.log('sql');
        console.log(sql);
        let payload = {};
        try {
            const [rows, fields] = (await this.connection.query(sql)) as any;
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

    async createProposal(udid: string, proposalConf: object) {
        /*
        {
            id: '3HmHetGL2CXTG0wa7PqKQDapobq2',
            name: 'matheus cruz',
            city: 'teste',
            car_seat: 1,
            lift_seat: 1,
            test: 1 },
        }
    */
        proposalConf['create_timestamp'] = new Date();
        proposalConf['statusInfo'] = {
            status: 'REQUESTED',
            time_stamp: new Date(),
        };
        console.log('proposalConf');
        console.log(proposalConf);
        let proposalId = await this.firebaseService.addProposal(udid, proposalConf);
        let sql = '';
        sql += 'INSERT INTO k4k.proposal';
        sql += ' (proposal_uid,';
        sql += 'race_uid,';
        sql += 'mother_uid,';
        sql += 'driver_uid,';
        sql += 'create_timestamp,';
        sql += 'status,';
        sql += 'expired)';
        sql += ' VALUES (';
        sql += "'" + proposalId + "',";
        sql += "'" + proposalConf['race_id'] + "',";
        sql += "'" + proposalConf['mother_id'] + "',";
        sql += "'" + proposalConf['driver_id'] + "',";
        sql += 'NOW(),';
        sql += "'REQUESTED',";
        sql += 0;
        sql += ')';
        console.log('sql');
        console.log(sql);
        let payload = {};
        try {
            const res = await this.connection.query(sql);
            console.log(res);
            payload['success'] = true;
        } catch (err) {
            console.log(err);
            payload['errors'] = err;
            payload['success'] = false;
        }
        return payload;
    }

    /*TODO
    set driver id in the race (firebase)
    */
    async acceptProposal(driverUdid: string, proposalId: string) {
        const proposalInfo = await this.firebaseService.getProposal(driverUdid, proposalId);
        console.log('proposalInfo');
        console.log(proposalInfo);
        const motherUdid = proposalInfo['mother_id'];
        const raceId = proposalInfo['race_id'];

        let payload = {};

        const driverSet = await this.setDriver(driverUdid, motherUdid, raceId);

        if (driverSet) {
            const statusInfo = {
                status: 'ACCEPTED',
                timestamp: Date.now(),
            };
            await this.firebaseService.setProposalStatus(driverUdid, proposalId, statusInfo);

            let sql = '';
            sql += 'UPDATE k4k.proposal';
            sql += ' SET ';
            sql += "status='ACCEPTED',";
            sql += 'answser_timestamp=NOW()';
            sql += ' WHERE ';
            sql += " proposal_uid = '" + proposalId + "'";

            console.log('sql');
            console.log(sql);

            try {
                const res = await this.connection.query(sql);
                console.log(res);
                let driverAssignment = {
                    driver_id: driverUdid,
                    mother_id: motherUdid,
                    race_id: raceId,
                    proposal_id: proposalId,
                };
                await this.processDriverAssignment(driverAssignment);
                payload['success'] = true;
            } catch (err) {
                console.log(err);
                payload['errors'] = err;
                payload['success'] = false;
            }
        } else {
            payload['errors'] = 'driver_already_assigned';
            payload['success'] = false;
        }

        return payload;
    }

    async rejectProposal(driverUdid: string, proposalId: string) {
        let payload = {};

        const statusInfo = {
            status: 'REJECTED',
            timestamp: Date.now(),
        };
        await this.firebaseService.setProposalStatus(driverUdid, proposalId, statusInfo);

        let sql = '';
        sql += 'UPDATE k4k.proposal';
        sql += ' SET ';
        sql += "status='REJECTED',";
        sql += 'answser_timestamp=NOW()';
        sql += ' WHERE ';
        sql += " proposal_uid = '" + proposalId + "'";

        console.log('sql');
        console.log(sql);

        try {
            const res = await this.connection.query(sql);
            console.log(res);
            payload['success'] = true;
        } catch (err) {
            console.log(err);
            payload['errors'] = err;
            payload['success'] = false;
        }

        return payload;
    }

    async setLostOtherProposals(driverUdid: string, proposalId: string) {
        const proposalInfo = await this.firebaseService.getProposal(driverUdid, proposalId);
        console.log('proposalInfo');
        console.log(proposalInfo);
        const raceId = proposalInfo['race_id'];

        let payload = {};

        const otherProposalInfo = await this.getOtherProposals(raceId, proposalId);
        console.log('otherProposalInfo');
        console.log(otherProposalInfo);
        for (var index in otherProposalInfo['data']) {
            let proposal = otherProposalInfo['data'][index];
            console.log(proposal);
            const statusInfo = {
                status: 'LOST',
                timestamp: Date.now(),
            };
            await this.firebaseService.setProposalStatus(proposal['driver_uid'], proposal['proposal_uid'], statusInfo);
        }

        let sql = '';
        sql += 'UPDATE k4k.proposal';
        sql += ' SET ';
        sql += "status='LOST',";
        sql += 'expired=1,';
        sql += 'expire_timestamp=NOW()';
        sql += ' WHERE ';
        sql += " proposal_uid != '" + proposalId + "'";
        sql += " AND race_uid = '" + raceId + "'";
        sql += " AND status='REQUESTED'";

        console.log('sql');
        console.log(sql);

        try {
            const res = await this.connection.query(sql);
            console.log(res);

            payload['success'] = true;
        } catch (err) {
            console.log(err);
            payload['errors'] = err;
            payload['success'] = false;
        }

        return payload;
    }

    async getProposal(proposalId: string) {
        let sql = 'SELECT * FROM k4k.proposal WHERE 1 ';
        sql += " AND proposal_uid = '" + proposalId + "'";

        console.log('sql');
        console.log(sql);
        let payload = {};
        try {
            const [rows, fields] = (await this.connection.query(sql)) as any;
            console.log(rows, fields);
            payload['data'] = rows;
            payload['success'] = true;
        } catch (err) {
            console.log(err);
            payload['errors'] = err;
            payload['success'] = false;
        }

        return payload;
    }

    async getOtherProposals(raceId: string, proposalId: string) {
        let sql = 'SELECT * FROM k4k.proposal WHERE 1 ';
        sql += " AND proposal_uid != '" + proposalId + "'";
        sql += " AND race_uid = '" + raceId + "'";
        sql += " AND status='REQUESTED'";

        console.log('sql');
        console.log(sql);
        let payload = {};
        try {
            const [rows, fields] = (await this.connection.query(sql)) as any;
            console.log(rows, fields);
            payload['data'] = rows;
            payload['success'] = true;
        } catch (err) {
            console.log(err);
            payload['errors'] = err;
            payload['success'] = false;
        }

        return payload;
    }

    async setDriver(driverUdid: string, motherUdid: string, raceId: string) {
        let sql = '';
        sql += 'INSERT INTO k4k.race';
        sql += ' SET ';
        sql += "race_id ='" + raceId + "',";
        sql += "driver_id = '" + driverUdid + "',";
        sql += "mother_id = '" + motherUdid + "'";

        console.log('sql');
        console.log(sql);
        let payload = {};
        try {
            const res = await this.connection.query(sql);
            console.log(res);

            // todo accept driver into the firebase

            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async processDriverAssignment(driverAssignment: object) {
        const conn = await connect(this.raabitmqSettings);
        const ch = await conn.createChannel();
        var q = 'k4k-driver-assignment';
        var msg = JSON.stringify(driverAssignment);
        await ch.assertQueue(q, { durable: false });
        await ch.sendToQueue(q, new Buffer(msg));
        console.log(' [x] Sent %s', msg);
        //await conn.close();

        let payload = driverAssignment;

        return payload;
    }
}
