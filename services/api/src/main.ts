import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import express from 'express';
import crypto from 'crypto';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bodyParser: false, logger });

  // Trace ID 中间件 —— 每个请求分配唯一 ID，用于日志串联
  app.use((req: any, _res: any, next: any) => {
    req.traceId = req.headers['x-trace-id'] || `req_${crypto.randomUUID().slice(0, 8)}`;
    const start = Date.now();
    _res.on('finish', () => {
      const elapsed = Date.now() - start;
      const structuredLog = {
        ts: new Date().toISOString(),
        level: _res.statusCode >= 400 ? 'warn' : 'info',
        trace: req.traceId,
        method: req.method,
        path: req.originalUrl || req.url,
        status: _res.statusCode,
        elapsed,
      };
      if (_res.statusCode >= 500) {
        logger.error(JSON.stringify(structuredLog));
      } else if (_res.statusCode >= 400) {
        logger.warn(JSON.stringify(structuredLog));
      } else {
        logger.log(JSON.stringify(structuredLog));
      }
    });
    next();
  });

  // 支持最多两张 8MB 图片转 Base64 后的 JSON 请求，具体图片大小仍在 scoring 接口二次校验
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ limit: '30mb', extended: true }));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS —— 反射请求方 Origin，兼容前端跑在任意端口（dev server 端口未写死时也能通）
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('StyleMate API')
    .setDescription('穿搭助手 API 文档')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 API server running on http://localhost:${port}`);
  logger.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
