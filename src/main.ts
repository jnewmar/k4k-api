import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import bodyParser = require('body-parser');
import { checkIfAuthenticated } from './middlewares/auth-middleware';
import * as compression from 'compression';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log','error'],
        bodyParser: true,
        cors: true,
    });
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        })
    );

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }));
    // parse application/json
    app.use(bodyParser.json());
    //app.use(urlencoded({ extended: true }));
    //app.use(json());
    app.use(helmet());
    app.use(compression());
    app.use(checkIfAuthenticated);
    app.enableCors();
    await app.listen(3000);
}
bootstrap();
