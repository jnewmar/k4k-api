import Person from './person';
import Equiments from './equipments';
import BankData from './bank-data';
import Wallet from './wallet';

export default class Driver extends Person {
    email: string;
    indicationCode: string;
    ownIndicationCode: string;
    equipments: Equiments;
    availableToRides: boolean;
    inRace: boolean;
    currentRace: string;
    userCameFrom: string;
    bankData: BankData;
    wallet: Wallet;
}
