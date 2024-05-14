import * as helmet from 'helmet';
import * as compression from 'compression';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

(async () => {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'error'],
        bodyParser: true,
        cors: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        })
    );

    app.use(helmet());
    app.use(compression());
    app.enableCors();

    await app.listen(3000);
})();
