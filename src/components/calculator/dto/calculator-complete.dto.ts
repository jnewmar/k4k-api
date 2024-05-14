import {
    IsNotEmpty,
    IsInt,
    Min,
    Max,
    MinLength,
    ValidateNested,
    IsOptional,
    IsDefined,
    IsInstance,
    registerDecorator,
    validate,
    ValidationArguments,
    Validator,
    ValidationOptions,
    ValidatePromise,
    ArrayMinSize,
    IsNumber,
} from 'class-validator';
import { Type, plainToClass } from 'class-transformer';
import { Transform } from 'class-transformer';

export class BackDto {
    @IsNotEmpty()
    @IsDefined()
    @IsNumber()
    @Min(0)
    distance: number;

    @IsNotEmpty()
    @IsDefined()
    @IsInt()
    @Min(0)
    duration: number;

    @IsNotEmpty()
    @IsDefined()
    @IsInt()
    @Min(0)
    time: number;
}

export class DayDto {
    @IsNotEmpty()
    @IsDefined()
    @IsInt()
    @Min(0)
    @Max(6)
    weekday: number;

    @IsNotEmpty()
    @IsDefined()
    @IsNumber()
    @Min(0)
    distance: number;

    @IsNotEmpty()
    @IsDefined()
    @IsInt()
    @Min(0)
    duration: number;

    @IsNotEmpty()
    @IsDefined()
    @IsInt()
    @Min(0)
    time: number;

    @Type(() => BackDto)
    @IsOptional()
    back: BackDto[];
}

export class InputDto {
    @IsNotEmpty()
    @IsDefined()
    @IsInt()
    @Min(0)
    @Max(1)
    city: number;

    @IsNotEmpty()
    @IsDefined()
    @IsInt()
    @Min(1)
    @Max(4)
    shared: number;

    @IsNotEmpty()
    @IsDefined()
    @IsInt()
    @Min(0)
    @Max(18)
    age: number;

    @ValidateNested({ each: true })
    @Type(() => DayDto)
    @IsDefined()
    @ArrayMinSize(1)
    days: DayDto[];
}

export class CalculatorCompleteDto {
    @ValidateNested()
    @Type(() => InputDto)
    @IsNotEmpty()
    @IsDefined()
    readonly input: InputDto[];
}
export class CalculateSingleRideDto {
    @IsNotEmpty()
    @IsDefined()
    @IsInt()
    @Min(0)
    duration: number;

    @IsNotEmpty()
    @IsDefined()
    @IsNumber()
    @Min(0)
    km: number;

    @IsNotEmpty()
    @IsDefined()
    @IsInt()
    @Min(0)
    time: number;

    @IsNotEmpty()
    @IsDefined()
    @IsInt()
    @Min(0)
    @Max(18)
    age: number;

    @IsNotEmpty()
    @IsDefined()
    @IsNumber()
    city: number;
}
