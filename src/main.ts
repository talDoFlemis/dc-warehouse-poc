import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'yourSecretKey',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('DC Warehouse POC')
    .setDescription('API do almoxarifado do departamento de informática DC')
    .setVersion('1.0.0')
    .addTag('Equipamentos')
    .addTag('Autenticação')
    .addTag('Usuários')
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
