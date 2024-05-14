import { Injectable, NestMiddleware } from '@nestjs/common';
import { auth } from 'firebase-admin';

@Injectable()
export class UserAuthMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            req.authToken = req.headers.authorization.split(' ')[1];
            const { authToken } = req;
            auth()
                .verifyIdToken(authToken)
                .then((userInfo) => {
                    req.headers.firebaseUid = userInfo.uid
                    req.authId = userInfo.uid;
                    return next();
                })
                .catch(() => res.status(401).send({ error: 'You are not authorized to make this request' }));
        } else return res.status(401).send({ error: 'You are not authorized to make this request' });
    }
}
