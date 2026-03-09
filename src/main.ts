import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ConfigModule } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: 'yourSecretKey',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    }),
  );
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('DC Warehouse POC example')
    .setDescription('DC Warehouse cats API description')
    .setVersion('0.420.69')
    .addTag('warehouse')
    .build();
  const document = () => SwaggerModule.createDocument(app, config);
  app.use(
    '/reference',
    apiReference({
      content: document,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
