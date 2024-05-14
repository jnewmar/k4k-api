import { Controller, Post, Body, Req } from '@nestjs/common';
import { RaceService } from './race.service';

@Controller('race')
export class RaceController {
    constructor(private raceServive: RaceService) {}

    @Post('get-possible-drivers')
    async getPossibleDrivers(@Body() body: any, @Req() req: any) {
        console.log(body);
        console.log(typeof body);
        const loggedUserd = req.authId;
        console.log('loggedUserd');
        console.log(loggedUserd);

        //const raceInfo =  await this.firebaseService.getRace(body['race_id']);
        //console.log('raceInfo');
        //console.log(raceInfo);

        let payload = {};
        payload = await this.raceServive.getPossibleDrivers();

        return payload;
    }
}
