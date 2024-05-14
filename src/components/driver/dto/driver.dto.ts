import { IsString, IsNotEmpty, IsDateString, IsBoolean } from 'class-validator';

export default class DriverDTO {
    
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    firebaseUid: string;

    @IsString()
    @IsNotEmpty()    
    CPF: string;

    @IsString()
    @IsNotEmpty()
    RG: string;

    @IsDateString()
    birthDate: Date;

    @IsString()
    @IsNotEmpty()    
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    indicationCode: string;

    @IsString()
    @IsNotEmpty()
    ownIndicationCode: string;

    @IsBoolean()    
    haveCarSeat: boolean;

    @IsBoolean()
    haveLiftSeat: boolean;
    
    @IsBoolean()
    availableToRides: boolean;
    
    @IsBoolean()
    inRide: boolean;

    @IsString()
    @IsNotEmpty()
    userCameFrom: string;

    profilePhoto: string;

    currentRace: string;

    addressUuid: string;
    
    bankDataUuid: string;
}