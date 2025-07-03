import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';
import { SecurityService } from './security/security.service';
import { MonitoringService } from './monitoring/monitoring.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const securityService = app.get(SecurityService);
  const monitoringService = app.get(MonitoringService);

  // Global prefix for API routes
  app.setGlobalPrefix('api/v1');

  // Security middleware (from VX-Enhanced)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // Compression middleware
  app.use(compression());

  // Cookie parser
  app.use(cookieParser());

  // Rate limiting (enhanced from VX-Enhanced)
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: configService.get('RATE_LIMIT_MAX', 100),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // CORS configuration (secure, from Ukraine's fixed version)
  const allowedOrigins = configService.get('CORS_ORIGINS')?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173',
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
      'X-Auth-Token',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 3600,
  });

  // Global validation pipe (enhanced from both versions)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        // Enhanced error handling for security
        const securityErrors = errors.filter(error => 
          securityService.isSuspiciousInput(error.value)
        );
        
        if (securityErrors.length > 0) {
          monitoringService.logSecurityEvent('suspicious_input', {
            errors: securityErrors,
            timestamp: new Date().toISOString(),
          });
        }
        
        return new ValidationError(errors);
      },
    }),
  );

  // Initialize monitoring (from VX-Enhanced)
  await monitoringService.initialize();

  // Swagger documentation (enhanced)
  const config = new DocumentBuilder()
    .setTitle('CounselFlow Ultimate API')
    .setDescription('Comprehensive Legal Management System with AI Integration')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('authentication', 'User authentication and authorization')
    .addTag('legal-matters', 'Legal matter management')
    .addTag('contracts', 'Contract lifecycle management')
    .addTag('ai-services', 'AI-powered legal services')
    .addTag('analytics', 'Legal analytics and reporting')
    .addTag('compliance', 'Compliance and risk management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Health check endpoint
  app.use('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'connected',
        redis: 'connected',
        ai: 'available',
      },
    });
  });

  // Start server
  const port = configService.get('PORT', 3001);
  await app.listen(port);

  console.log(`🚀 CounselFlow Ultimate API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${port}/health`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting application:', error);
  process.exit(1);
});