import { Controller, Post, Body, Res, Get, Param, HttpCode, UseGuards, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { PusherService } from '../../services/pusher/pusher.service';
import { EskolareService } from './eskolare.service';
import { EmailDispatcherService } from '../../services/email-dispatcher/email-dispatcher.service';
import { ProcessTemplateService } from '../../services/process-template/process-template.service';
import formatRegistry from '../../utils/formatRegistry.util';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FirebaseService } from '../firebase/firebase.service';
import EskolareProduct from '../../entities/eskolare-product.entity';
import Address from '../../entities/address.entity';
import generateSimpleHash from '../../utils/generateSimpleHash.util';
import { EskolareAuthGuard } from '../../guards/eskolare-auth/eskolare-auth.guard';
import { Console } from 'console';

@Controller('eskolare')
export class EskolareController {
    constructor(
        @InjectRepository(Address) private addressRepository: Repository<Address>,
        @InjectRepository(EskolareProduct) private eskolareProductRepository: Repository<EskolareProduct>,
        private readonly firebaseService: FirebaseService,
        private readonly pusher: PusherService, 
        private readonly emailDispatcher: EmailDispatcherService, 
        private readonly templateService: ProcessTemplateService,
        private readonly eskolareService: EskolareService) {}

    @Post('cancelOrder')
    @UseGuards(EskolareAuthGuard)
    @HttpCode(200)
    cancelOrder(@Body() body: any): void {
        this.firebaseService.saveEskolareOrder('cancel',body);
        this.pusher.trigger({ channel: 'eskolare', name: 'cancel-order', payload: {order: body.data,} });
    }

    @Post('fulfillmentOrder')
    @UseGuards(EskolareAuthGuard)
    @HttpCode(200)
    fulfillmentOrder(@Body() body: any): void {
        this.firebaseService.saveEskolareOrder('fulfillment',body);
        this.pusher.trigger({channel: 'eskolare',name: 'fulfillment-order',payload: {order: body.data}});
    }

    @Get('getOrder/:orderNumber')
    getOrder(@Res() response: Response, @Param() params: any): void {
        this.eskolareService
            .getOrder(params.orderNumber)
            .then((order: any) => response.status(200).json({ message: 'ok', order }))
            .catch((err: any) => response.status(400).json({ message: 'Número de pedido invalido', err }));
    }

    @Post('listOrders')
    listOrders(@Res() response: Response, @Body() searchOrderConfig: any): void {
        this.eskolareService
            .listOrders(searchOrderConfig)
            .then((orders: any) => response.status(200).json({ message: 'ok', orders }))
            .catch((err: any) => response.status(400).json({ message: 'Erro na busca/listagem', err }));
    }

    @Post('createOrder')
    @UseGuards(EskolareAuthGuard)
    @HttpCode(200)
    async createOrdem(@Body() body: any): Promise<any> {
        try {
            const orderSaved = await this.firebaseService.saveEskolareOrder('new',body);

            const orderRaw = body.data;
    
            const custumerRegistry = formatRegistry(orderRaw.customer.document);
    
            let user = await this.firebaseService.getUserByRegistry(custumerRegistry);
                
            let userUid = '';
    
            if(user) 
                userUid = Object.entries(user)[0][0];
            else {   
            userUid = await this.firebaseService.createUser({
                    private: {
                        cpf: custumerRegistry,
                        name: `${orderRaw.customer.first_name} ${orderRaw.customer.last_name}`,
                        email: orderRaw.customer.email,
                        phone: `(${orderRaw.customer.phone_area_code}) ${String(orderRaw.customer.phone_number).slice(0,5)}-${String(orderRaw.customer.phone_number).slice(5,9)}`,
                        userStatus: 'inAnalysis',
                        userType: 'Parents',
                        userCameFrom: 'Eskolare',
                        myIndicationCode: generateSimpleHash()
                    }
                })
            }

            const orderInProcess = {
                userUid,
                date: new Date().getTime(),
                eskolareOrderNumber: orderRaw.order_number,
                eskolareOrderData: orderRaw
            };

            await this.firebaseService.saveEskolareOrder('inProcess', orderInProcess);

            const htmlToSend = await this.templateService.proccessTemplate(`emails/Eskolare-new-order.html`, {
                customerName: `${orderRaw.customer.first_name} ${orderRaw.customer.last_name}`,
                productTitle: orderRaw.groups[0].lines[0].product.title,
                orderNumber: orderRaw.order_number,
            });
    
            this.emailDispatcher.sendEmail({ 
                to: orderRaw.customer.email, 
                subject: `Kar4kids - Eskolare | Pedido:${orderRaw.order_number}`, 
                text: '', 
                html: htmlToSend 
            })
                
            await this.pusher.trigger({channel: 'eskolare',name: 'create-order',payload: { order: orderInProcess }});
        }
        catch(err) {
            console.log('Erro ao criar pedido da Eskolare', err);
        }
    }
    
    @Get('test')
    test(@Req() request: Request, @Res() response: Response) {
        console.log(request.headers)

        this.firebaseService.getUserByRegistry('479.808.958-35')
        .then((res) => response.status(200).send(res).end())
        .catch((err) => response.status(500).send(err).end())
    }

    private prepareTemplateReplacements(data: any): any {
        const replacements = {
            order: {
                number: data.order_number,
                name: data.groups.lines[0].product.title,
                local: data.school.local,
                activitiesPerWeek: data.activitiesPerWeek,
                payment: {
                    installments: data.payments[0].installments,
                    installments_amount: data.payments[0].installment_amount
                },
                school: {
                    name: data.school.name,
                    fullAddress: data.school.fullAddress,
                    class: data.school.class
                }
            },
            user: {
                name: `${data.customer.first_name} ${data.customer.last_name}`,
                phoneNumber: `(${data.customer.phone_country_code}) ${data.customer.phone_area_code}${data.customer.phone_number}`,
                document: formatRegistry(data.customer.document),
                document_type: data.customer.document_type
            },
            kid: {
                name: `${data.groups[0].enrollment.student.first_name} ${data.groups[0].enrollment.student.last_name}`,
                birthDate: data.groups[0].enrollment.student.birthDate,
                gender: data.groups[0].enrollment.student.gender,
                relationship: data.groups[0].enrollment.student.relationship,
                school: data.groups[0].institution.display_name,
                serie: data.groups[0].showcase.store
            },
        }

        return replacements;
    }
  
}
