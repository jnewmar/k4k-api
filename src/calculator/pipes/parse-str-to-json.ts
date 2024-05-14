import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Validator } from 'class-validator';
import { transformAndValidateSync } from 'class-transformer-validator';
import { InputDto } from '../dto/calculator-complete.dto';

@Injectable()
export class ParseStrToJson implements PipeTransform<string, object> {
    transform(value: string, metadata: ArgumentMetadata): object {
        const validator = new Validator();
        //console.log(typeof value);
        //console.log(value);
        if (validator.isEmpty(value)) {
            throw new BadRequestException('Input should be a valid Json');
        }
        try {
            return transformAndValidateSync(InputDto, value.toString());
        } catch (error) {
            //console.log(error);
            throw new BadRequestException(error);
        }
    }
}
