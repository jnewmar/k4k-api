import { Controller, Post, Param, Req, Body } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Controller('firebase')
export class FirebaseController {
    constructor(private firebaseService: FirebaseService) {}

    @Post('/users')
    getUsers() {
        const ret = this.firebaseService.getAllUsers();
        return ret;
    }

    @Post('/user/:id')
    getUser(@Param('id') id: string) {
        const ret = this.firebaseService.getUser(id);
        return ret;
    }

    @Post('/korridas/parent/')
    async getParentKorridas(@Body() body: any, @Req() req: any) {
        console.log(body);
        console.log(typeof body);
        console.log('req.authId');
        console.log(req.authId);
        let user_id = req.authId; // 'hWATQKrrpSb9AgXMaraAKpROj6J2';
        //const user = await this.firebaseService.getUser(req.authId);
        //console.log('user');
        //console.log(user);

        const ret = this.firebaseService.getParentKorridas(user_id);
        return ret;
    }

    @Post('/race/add')
    addRace() {
        const ret = this.firebaseService.addRace();
        return ret;
    }

    @Post('/race/:id')
    async getRace(@Param('id') id: string) {
        console.log(id);
        const ret = await this.firebaseService.getRace(id);
        console.log(ret);
        return ret;
    }
}
