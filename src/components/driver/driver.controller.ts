import { Controller, Get, Res, Req, Param, Patch, Put, Body, Post } from '@nestjs/common';
import { Response, Request } from 'express';
import { DriverService } from './driver.service';
//import Driver from '../../entities/driver.entity';
//import DriverDTO from './dto/driver.dto';
import { isValid, format } from 'cpf';
//import CreateDriverDTO from './dto/createDriver.dto';

@Controller('driver')
export class DriverController {

    constructor(private readonly driverService: DriverService){}

    /*
    @Post()
    createDriver(@Res() response: Response, newDriver: CreateDriverDTO): void {
        
    }

    @Get()
    getDriver(@Res() response: Response, @Req() request: Request): void {
        const firebaseUid = (request.headers.firebaseUid as string);

        this.driverService.getDriverByFirebaseUid(firebaseUid)
        .then((driver: Driver) => response.status(200).json({ message: 'ok', driver: (driver as DriverDTO)}))
        .catch((err: any) => response.status(404).json({ message: 'Não foi possivel localizar a mãetorista', err }));
    }

    @Put('update')
    updateDriver(@Res() response: Response, @Body() driver: DriverDTO): void {
        this.driverService.updateDriver(driver as Driver)
        .then((driver) => response.status(201).json({ message: 'ok', driver }))
        .catch((err: any) => response.status(400).json({ message: 'Erro ao atualizar a mãetorista, dados invalidos', err}));
    }

    */
    @Get('validateRegistry/:registry')
    verifyDriverRegistry(@Res() response: Response, @Param() params: any): void {
        let registry = params.registry;

        if(!registry) 
            response.status(400).json({ message: 'CPF não informado!' });

        else if(!isValid(registry))
            response.status(200).json({ message: 'CPF invalido!' });

        else {
            registry = format(registry);

            this.driverService.verifyDriverRegistryExistence(registry)
            .then((value: boolean) => response.status(200).json({ valid: value }))
            .catch((err: any) => response.status(500).json({ message: 'Erro ao validar o CPF', err}));
        }
    }
}
