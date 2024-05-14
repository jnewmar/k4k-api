import Model from './model';

export default class Location extends Model {
    latitude: number;
    longitude: number;
    accuracy: number;
    heading: number;
    speed: number;
    altitude: number;
    altitudeAccuracy: number;
    moment: Date;
}
