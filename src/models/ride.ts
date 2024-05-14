import Model from './model';
import Kid from './kid';
import rideDuration from './ride-duration';

export default class Ride extends Model {
    name: string;
    driverId: string;
    parentId: string;
    kids: Array<Kid>;
    statusId: number;
    type: string;
    details: string;
    catchKidsAt: Date;
    leaveKidsAt: Date;
    distance: number;
    backRide: boolean;
    duration: rideDuration;
    isRideMonthlyChild: boolean;
    rideMonthlyChildId: number;
    ridePrice: number;
    driverProfit: number;
}
