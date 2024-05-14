import { IsString, IsNotEmpty } from 'class-validator';

export class AcceptRace {
    @IsString()
    @IsNotEmpty()
    parentId: string;

    @IsString()
    @IsNotEmpty()
    raceKey: string;

    @IsString()
    @IsNotEmpty()
    driverId: string;
}
