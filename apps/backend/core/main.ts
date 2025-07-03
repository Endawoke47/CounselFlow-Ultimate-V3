import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';
import { CatchEverythingFilter } from './common/filters/catch-everything.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from the uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const config = new DocumentBuilder()
    .setTitle('CounselFlow Ukraine API')
    .setDescription('Legal Management System API for Ukrainian Legal Professionals')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra properties are provided
      forbidUnknownValues: true,
      transform: true, // Automatically transforms payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Converts string values to proper types (e.g., '123' to number)
        exposeDefaultValues: true,
        enableCircularCheck: true,
      },
    }),
  );

  app.use(cookieParser());

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CatchEverythingFilter(httpAdapterHost));

  // CORS Configuration - Secure and Environment-based
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',')
    : process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://counselflow-ukraine.com']
    : [
        'http://localhost:3000',
        'http://localhost:4000', 
        'http://localhost:5173',
        'http://localhost:8080'
      ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Auth-Token'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 3600,
  });

  await app.listen(process.env.PORT ?? 5005);
}
bootstrap();
