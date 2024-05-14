import { Injectable } from '@nestjs/common';
import { CalculatorConfig } from './calculator.model';

@Injectable()
export class CalculatorService {
    private config: CalculatorConfig = {
        id: 'v1.2',
        minumumPrice: 10,
        initialPrice: 2.4,
        k4kPhiDefault: 0.2,
        pricePerTime: 0.312,
        pricePerDistance: 1.68,
        rushTaxTable: {
            0: 1,
            1: 1,
            2: 1,
            3: 1,
            4: 1,
            5: 1,
            6: 1,
            7: 1.2,
            8: 1.2,
            9: 1.2,
            10: 1,
            11: 1,
            12: 1.2,
            13: 1.2,
            14: 1,
            15: 1,
            16: 1,
            17: 1.2,
            18: 1.2,
            19: 1.2,
            20: 1,
            21: 1,
            22: 1,
            23: 1,
        },
        recursionDiscountTable: {
            1: 0.02,
            2: 0.05,
            3: 0.05,
            4: 0.05,
            5: 0.1,
            6: 0.1,
            7: 0.1,
            8: 0.15,
            9: 0.15,
            10: 0.2,
            11: 0.2,
            12: 0.2,
        },
        perSharingDiscountTable: {
            1: 0,
            2: 0.4,
            3: 0.6,
            4: 0.7,
        },
        driverTaxTable: {
            1: 0.25,
            2: 0.25,
            3: 0.25,
            4: 0.25,
            5: 0.25,
            6: 0.25,
            7: 0.25,
            8: 0.25,
            9: 0.25,
            10: 0.25,
            11: 0.25,
            12: 0.25,
        },
        perMonthTable: {
            1: 4.3,
            2: 8.6,
            3: 12.9,
            4: 17.1,
            5: 21.4,
            6: 25.7,
            7: 30.0,
            8: 34.3,
            9: 38.6,
            10: 42.9,
            11: 47.1,
            12: 51.4,
        },
        k4kPhiPerCity: {
            0: 0.2, // Mogi das Cruzes
            1: 0.5, //Sao Paulo
        },
        Cities: {
            0: 'Mogi das Cruzes',
            1: 'São Paulo',
        },
        k4kPhiPerKidAge: {
            '0-5': 1.2,
            '6-10': 1.1,
            '10+': 1,
        },
    };

    public calculateSingleRidePrice(time: number, duration: number, distance: number, kidAge: string, city?: number): number {
        let price: number;

        let k4kPhi: number;
        if (city == undefined) {
            k4kPhi = this.config.k4kPhiDefault;
        } else {
            k4kPhi = this.config.k4kPhiPerCity[city];
        }

        price = this.config.initialPrice;
        //console.log(price);
        //console.log(distance,this.config.pricePerDistance);
        price = price + distance * this.config.pricePerDistance;
        //console.log(price);
        //console.log(duration,this.config.pricePerTime);
        price = price + duration * this.config.pricePerTime;
        //console.log(price);
        price = price * (1 + k4kPhi);
        //console.log(price);
        price = price * this.config.rushTaxTable[time];
        //console.log(price);
        price = price * this.config.k4kPhiPerKidAge[kidAge];
        //console.log(price);

        if (price < this.config.minumumPrice) {
            price = this.config.minumumPrice;
        }

        return price;
    }
    public calculateSingleRideDriverShare(time: number, duration: number, distance: number, kidAge: string, city?: number): number {
        let price: number;
        price = this.calculateSingleRidePrice(time, duration, distance, kidAge, city);
        price = price * (1 - this.config.driverTaxTable[1]);

        return price;
    }

    //----------------------------------------------------------------------

    public calculatePrice(time: number, duration: number, distance: number, timesPerWeek: number, sharedPassengers: number, kidAge: string, city: number): number {
        let price: number;

        let k4kPhi: number;
        if (city == undefined) {
            k4kPhi = this.config.k4kPhiDefault;
        } else {
            k4kPhi = this.config.k4kPhiPerCity[city];
        }

        price = this.config.initialPrice;
        //console.log(price);
        //console.log(distance,this.config.pricePerDistance);
        price = price + distance * this.config.pricePerDistance;
        //console.log(price);
        //console.log(duration,this.config.pricePerTime);
        price = price + duration * this.config.pricePerTime;
        //console.log(price);
        price = price * (1 + k4kPhi);
        //console.log(price);
        price = price * this.config.rushTaxTable[time];
        //console.log(price);
        price = price * this.config.k4kPhiPerKidAge[kidAge];
        //console.log(price);

        price = price * (1 - this.config.recursionDiscountTable[timesPerWeek]);
        price = price * (1 - this.config.perSharingDiscountTable[sharedPassengers]);

        if (price < this.config.minumumPrice) {
            price = this.config.minumumPrice;
        }

        return price;
    }

    public calculatePriceDriverShare(time: number, duration: number, distance: number, timesPerWeek: number, sharedPassengers: number, kidAge: string, city: number): number {
        let price: number;
        price = this.calculatePrice(time, duration, distance, timesPerWeek, sharedPassengers, kidAge, city);
        price = price * (1 - this.config.driverTaxTable[timesPerWeek]);

        return price;
    }

    public calculatePricePerMonth(time: number, duration: number, distance: number, timesPerWeek: number, sharedPassengers: number, kidAge: string, city: number): number {
        let price: number;
        price = this.calculatePrice(time, duration, distance, timesPerWeek, sharedPassengers, kidAge, city);
        price = price * this.config.perMonthTable[timesPerWeek];

        return price;
    }

    public calculatePricePerMonthDriverShare(time: number, duration: number, distance: number, timesPerWeek: number, sharedPassengers: number, kidAge: string, city: number): number {
        let price: number;
        price = this.calculatePricePerMonth(time, duration, distance, timesPerWeek, sharedPassengers, kidAge, city);
        price = price * (1 - this.config.driverTaxTable[timesPerWeek]);

        return price;
    }
}
