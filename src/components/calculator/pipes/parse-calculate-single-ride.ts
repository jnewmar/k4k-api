import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Validator } from 'class-validator';
import { transformAndValidateSync } from 'class-transformer-validator';
import { CalculateSingleRideDto } from '../dto/calculator-complete.dto';

@Injectable()
export class ParseCalculateSingleRideDto implements PipeTransform<string, object> {
    transform(value: string, metadata: ArgumentMetadata): object {
        //console.log(typeof value);
        //console.log(value);
        value['time'] = parseInt(value['time'], 10);
        value['duration'] = parseInt(value['duration'], 10);
        value['km'] = parseFloat(value['km']);
        value['age'] = parseInt(value['age'], 10);
        //console.log(value);
        try {
            return transformAndValidateSync(CalculateSingleRideDto, value);
        } catch (error) {
            //console.log(error);
            throw new BadRequestException(error);
        }
    }
}
