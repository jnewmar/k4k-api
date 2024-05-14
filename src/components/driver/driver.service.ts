import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Driver from '../../entities/driver.entity'; 
import { Repository } from 'typeorm';
import DriverDTO from './dto/driver.dto';

@Injectable()
export class DriverService {

    constructor(@InjectRepository(Driver) private driverRepository: Repository<Driver> ){}

    public findManyDriversByIds(ids: Array<number>): Promise<Array<Driver>> {
        return this.driverRepository.findByIds(ids);
    }

    public getDriverById(id: number): Promise<Driver> {
        return this.driverRepository.findOne({where:{id: id}});
    }

    public getDriverByFirebaseUid(firebaseUid: string): Promise<Driver> {
        return this.driverRepository.findOne({where:{firebaseUid: firebaseUid}});
    }

    public saveDriver(driver:Driver) {
        return this.driverRepository.save(driver);
    }

    public updateDriver(driver: Driver) {
       driver.lastUpdate = new Date();
       return this.saveDriver(driver);
    }

    public verifyDriverRegistryExistence(registry: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                const driver = await this.driverRepository.findOne({where: {CPF: registry }});
                return driver ? resolve(true) : resolve(false);
            }
            catch(err){
                return reject(err);
            }
        });
    }
}
