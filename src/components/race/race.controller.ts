import { Controller, Post, Body, Req, Param } from '@nestjs/common';
import { RaceService } from './race.service';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('race')
export class RaceController {
    constructor(private raceServive: RaceService, private firebaseService: FirebaseService) {}
    @Post('request-driver')
    async requestDriver(@Body() body: any, @Req() req: any) {
        console.log(body);
        console.log(typeof body);
        const loggedUserd = req.authId;
        console.log('loggedUserd');
        console.log(loggedUserd);

        const raceInfo = await this.firebaseService.getRace(body['race_id']);
        console.log('raceInfo');
        console.log(raceInfo);

        const kid_id = raceInfo['kids'][0]['uid'];
        console.log('kid_id');
        console.log(kid_id);

        const kidInfo = await this.firebaseService.getKid(kid_id);
        console.log('kidInfo');
        console.log(kidInfo);

        const kid_age = calculate_age(kidInfo['age']);
        console.log('kid_age');
        console.log(kid_age);
        let car_seat = 0;
        let lift_seat = 0;
        if (kid_age <= 4) {
            car_seat = 1;
            lift_seat = 0;
        } else if (kid_age > 4 && kid_age <= 7) {
            car_seat = 0;
            lift_seat = 1;
        }

        const endDate = new Date(raceInfo['raceEndTimestamp']);
        const startDate = new Date(raceInfo['raceEndTimestamp'] - raceInfo['raceDuration']['maxValue']);

        const requestDriverConf = {
            race_id: body['race_id'],
            city: raceInfo['adress'],
            test: body['test'],
            car_seat: car_seat,
            lift_seat: lift_seat,
            race_type: raceInfo['raceType'],
            mother_id: loggedUserd,
            race_date: raceInfo['raceDate'],
            race_duration: raceInfo['raceDuration'],
            race_end_hour: raceInfo['raceEndHour'],
            raceEnd: endDate,
            raceStart: startDate,
            raceEndTimestamp: Math.floor(endDate.getTime() / 1000),
            raceStartTimestamp: Math.floor(startDate.getTime() / 1000),
            end: {
                year: endDate.getFullYear(),
                month: endDate.getMonth() + 1,
                day: endDate.getDate(),
                hour: endDate.getHours(),
                minute: endDate.getMinutes(),
            },
            start: {
                year: startDate.getFullYear(),
                month: startDate.getMonth() + 1,
                day: startDate.getDate(),
                hour: startDate.getHours(),
                minute: startDate.getMinutes(),
            },
            request_time: new Date(),
        };
        console.log('requestDriverConf');
        console.log(requestDriverConf);
        let payload = {};
        payload = await this.raceServive.requestDriver(requestDriverConf);

        return payload;
    }

    @Post('get-possible-drivers')
    async getPossibleDrivers(@Body() body: any, @Req() req: any) {
        console.log(body);
        console.log(typeof body);
        const loggedUserd = req.authId;
        console.log('loggedUserd');
        console.log(loggedUserd);

        const raceInfo = await this.firebaseService.getRace(body['race_id']);
        console.log('raceInfo');
        console.log(raceInfo);

        const kid_id = raceInfo['kids'][0]['uid'];
        console.log('kid_id');
        console.log(kid_id);

        const kidInfo = await this.firebaseService.getKid(kid_id);
        console.log('kidInfo');
        console.log(kidInfo);

        const kid_age = calculate_age(kidInfo['age']);
        console.log('kid_age');
        console.log(kid_age);
        let car_seat = 0;
        let lift_seat = 0;
        if (kid_age <= 4) {
            car_seat = 1;
            lift_seat = 0;
        } else if (kid_age > 4 && kid_age <= 7) {
            car_seat = 0;
            lift_seat = 1;
        }
        const requestDriverConf = {
            race_id: body['race_id'],
            city: raceInfo['adress'],
            test: body['test'],
            car_seat: car_seat,
            lift_seat: lift_seat,
            race_type: raceInfo['raceType'],
            mother_id: raceInfo['uidMother'],
            request_time: new Date(),
        };
        console.log('requestDriverConf');
        console.log(requestDriverConf);
        let payload = {};
        payload = await this.raceServive.getPossibleDrivers(requestDriverConf);

        return payload;
    }

    @Post('/proposal/:proposal_id/accept')
    async proposalAccept(@Param('proposal_id') proposal_id: string, @Req() req: any) {
        console.log(proposal_id);
        console.log(typeof proposal_id);
        const loggedUserd = req.authId;
        console.log('loggedUserd');
        console.log(loggedUserd);

        //todo check if logged user is a driver and the proposal is for the logged user
        // verificar status se status é  REQUETED

        let payload = {};
        payload = await this.raceServive.acceptProposal(loggedUserd, proposal_id);
        return payload;
    }

    @Post('/proposal/:proposal_id/reject')
    async proposalReject(@Param('proposal_id') proposal_id: string, @Req() req: any) {
        console.log(proposal_id);
        console.log(typeof proposal_id);
        const loggedUserd = req.authId;
        console.log('loggedUserd');
        console.log(loggedUserd);

        //todo check if logged user is a driver and the proposal is for the logged user
        // verificar status se status é  REQUESTED

        let payload = {};
        payload = await this.raceServive.rejectProposal(loggedUserd, proposal_id);
        return payload;
    }
}
function calculate_age(dateString) {
    var dob = new Date(dateString);
    var diff_ms = Date.now() - dob.getTime();
    var age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970);
}
