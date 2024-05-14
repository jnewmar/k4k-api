import { Controller, Post, Body, UsePipes, ValidationPipe, ParseIntPipe, Res } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
import { InputDto, CalculateSingleRideDto } from './dto/calculator-complete.dto';
import { ParseStrToJson } from './pipes/parse-str-to-json';
import { ParseCalculateSingleRideDto } from './pipes/parse-calculate-single-ride';
import { Response } from 'express';

@Controller('calculator')
export class CalculatorController {
    constructor(private calculatorService: CalculatorService) {}
    /*
Example of input

time:17
duration:10
km:2.9
age:5
city:0

Example of payload

{
    "price": 17.96,
    "driverShare": 13.47
}

*/
    @Post()
    calculateSingleRide(@Body(new ParseCalculateSingleRideDto()) body: CalculateSingleRideDto, @Res() response: Response): Response {
        let price: number;
        let kidAge: string;
        if (body.age < 6) {
            kidAge = '0-5';
        } else if (body.age >= 6 && body.age < 10) {
            kidAge = '6-10';
        } else {
            kidAge = '10+';
        }
        price = this.calculatorService.calculateSingleRidePrice(body.time, body.duration, body.km, kidAge, body.city);
        price = Math.round(100 * price) / 100;

        let driverShare = this.calculatorService.calculateSingleRideDriverShare(body.time, body.duration, body.km, kidAge, body.city);
        driverShare = Math.round(100 * driverShare) / 100;


        return response.status(200).json({price, driverShare});
    }

    /* Example of input
  {
   "city": 0,
   "shared":2,
   "age": 4
   "days":[
     {
       "weekday":0,
       "distance": 4.0,
       "duration": 12,
       "time": 13,
       "back":{
         "distance": 5.0,
         "duration": 18,
         "time": 18
       }
     },
     {
       "weekday":3,
       "distance": 4.0,
       "duration": 12,
       "time": 13
     },
     {
       "weekday":5,
       "distance": 4.0,
       "duration": 12,
       "time": 13
     }
   ]
}
Example of payload
{
    "price": 35.2,
    "driverShare": 26.4,
    "pricePerMonth": 151.34,
    "driverSharePerMonth": 113.51
}
  */
    @Post('/complete')
    calculateComplete(@Body() settings: InputDto, @Res() response: Response): Response {
        //calculateComplete(@Body('input', new ParseStrToJson()) settings: InputDto): number {
        //console.log(typeof settings);
        //console.log(settings);
        let total: number;
        let totalDriverShare: number;
        let totalPerMonth: number;
        let totalDriverSharePerMonth: number;
        let kidAge: string;

        if (settings['age'] < 6) {
            kidAge = '0-5';
        } else if (settings['age'] >= 6 && settings['age'] < 10) {
            kidAge = '6-10';
        } else {
            kidAge = '10+';
        }

        total = 0;
        totalDriverShare = 0;
        totalPerMonth = 0;
        totalDriverSharePerMonth = 0;
        if (typeof settings['days'] != 'undefined') {
            settings['days'].forEach((day) => {
                let price: number;
                let driverShare: number;
                let pricePerMonth: number;
                let driverSharePerMonth: number;
                //console.log(day['time'], day['duration'], day['distance'], 1, settings['shared'], settings['city']);
                price = this.calculatorService.calculatePrice(day['time'], day['duration'], day['distance'], 1, settings['shared'], kidAge, settings['city']);
                //console.log(price);
                driverShare = this.calculatorService.calculatePriceDriverShare(day['time'], day['duration'], day['distance'], 1, settings['shared'], kidAge, settings['city']);
                pricePerMonth = this.calculatorService.calculatePricePerMonth(day['time'], day['duration'], day['distance'], 1, settings['shared'], kidAge, settings['city']);
                //console.log(price);
                driverSharePerMonth = this.calculatorService.calculatePricePerMonthDriverShare(day['time'], day['duration'], day['distance'], 1, settings['shared'], kidAge, settings['city']);

                total += price;
                totalDriverShare += driverShare;
                totalPerMonth += pricePerMonth;
                totalDriverSharePerMonth += driverSharePerMonth;
                if (day['back'] != undefined) {
                    let priceBack: number;
                    let driverShareBack: number;
                    let priceBackPerMonth: number;
                    let driverShareBackPerMonth: number;
                    priceBack = this.calculatorService.calculatePrice(day['back']['time'], day['back']['duration'], day['back']['distance'], 1, settings['shared'], kidAge, settings['city']);
                    driverShareBack = this.calculatorService.calculatePriceDriverShare(
                        day['back']['time'],
                        day['back']['duration'],
                        day['back']['distance'],
                        1,
                        settings['shared'],
                        kidAge,
                        settings['city']
                    );
                    priceBackPerMonth = this.calculatorService.calculatePricePerMonth(
                        day['back']['time'],
                        day['back']['duration'],
                        day['back']['distance'],
                        1,
                        settings['shared'],
                        kidAge,
                        settings['city']
                    );
                    driverShareBackPerMonth = this.calculatorService.calculatePricePerMonthDriverShare(
                        day['back']['time'],
                        day['back']['duration'],
                        day['back']['distance'],
                        1,
                        settings['shared'],
                        kidAge,
                        settings['city']
                    );

                    //console.log(day['back']['time'], day['back']['duration'], day['back']['distance'], 1, settings['shared'], settings['city']);
                    //console.log(priceBack);
                    total += priceBack;
                    totalDriverShare += driverShareBack;
                    totalPerMonth += priceBackPerMonth;
                    totalDriverSharePerMonth += driverShareBackPerMonth;
                }
            });
            total = Math.round(100 * total) / 100;
            totalDriverShare = Math.round(100 * totalDriverShare) / 100;
            totalPerMonth = Math.round(100 * totalPerMonth) / 100;
            totalDriverSharePerMonth = Math.round(100 * totalDriverSharePerMonth) / 100;
        }

        return response.status(200).json({
            price: total,
            driverShare: totalDriverShare,
            pricePerMonth: totalPerMonth,
            driverSharePerMonth: totalDriverSharePerMonth,
        });
    }
}
