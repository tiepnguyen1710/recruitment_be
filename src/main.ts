import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from '@nestjs/passport';
import { TransformInterceptor } from './core/transform.intercepter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..','public'));
  app.setBaseViewsDir(join(__dirname, '..','views'));
  app.setViewEngine('ejs');
  
  app.useGlobalInterceptors(new TransformInterceptor(new Reflector));
  app.useGlobalPipes(new ValidationPipe());


  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  app.enableCors();

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2']
  });

  await app.listen(port);
}
bootstrap();
