import { ChargeInfo } from './chargeInfo';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class ChargeRaceRequest {
    chargeInfo: ChargeInfo;

    @IsNumber()
    driverProfit: number;

    @IsString()
    @IsNotEmpty()
    userIuguId: string;

    @IsString()
    @IsNotEmpty()
    raceKey: string;

    @IsString()
    @IsNotEmpty()
    userFirebaseId: string;
}
