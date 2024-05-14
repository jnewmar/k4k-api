import { Injectable } from '@nestjs/common';
import { auth } from 'firebase-admin';
import FirebaseUser from './interfaces/firebase-user.interface';

@Injectable()
export class FirebaseAuthService {
    private auth: auth.Auth;

    constructor() {
        this.auth = auth();
    }

    public createUser(newUser: FirebaseUser) {
        return this.auth.createUser(newUser);
    }

    public changeUserStatus(userUid: string, properties: FirebaseUser) {
        return this.auth.updateUser(userUid, properties);
    }

    public deleteUser(userUid: string) {
        return this.auth.deleteUser(userUid);
    }

    public getUser(userUid: string) {
        return this.auth.getUser(userUid);
    }
}
