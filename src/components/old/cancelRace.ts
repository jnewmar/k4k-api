import { IsString } from 'class-validator';

export class CancelRace {
    @IsString()
    userId: string;

    @IsString()
    raceKey: string;

    @IsString()
    driverId: string;
}
