import { Injectable } from '@nestjs/common';
import { IuguService } from './iugu/iugu.service';

@Injectable()
export class PaymentGatewayService extends IuguService {}
