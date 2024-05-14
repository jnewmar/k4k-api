import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '../../services/config/config.service';

@Injectable()
export class EskolareService {
    accessToken: string;
    url: string;

    constructor(
        private readonly httpService: HttpService, 
        private readonly configService: ConfigService,
        ) {
        this.accessToken = this.configService.environment.Eskolare.api_token;
        this.url = this.configService.environment.Eskolare.urlBase;
    }

    getOrder(orderNumber: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpService
                .get(`${this.url}orders/${orderNumber}`, {
                    headers: { Authorization: `Bearer ${this.accessToken}` },
                })
               .subscribe(
                   (res: any) => resolve(res.data), 
                   (error: any) => reject(error));
        });
    }

    listOrders({ ordering, customerName, order_total_min, order_total_max, date_created_gt, date_created_lt, status }): Promise<any> {
        const url = `${
            this.url
        }orders/?ordering=${ordering || 'date_created'}&search=${customerName || ''}&order_total_min=${order_total_min || 0}&order_total_max=${order_total_max || 2000}&date_created_gt=${date_created_gt || '2020-03-10'}&date_created_lt=${date_created_lt || '2020-03-10'}&status=${status || ''}`;
        return new Promise((resolve, reject) => {
            this.httpService
                .get(url, {
                    headers: { Authorization: `Bearer ${this.accessToken}` },
                })
                .subscribe(
                    (res: any) => resolve(res.data), 
                    (error: any) => reject(error));
        });
    }
    
}
