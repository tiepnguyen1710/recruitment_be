import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from 'src/jobs/schemas/job.schema';
import {
  Subscriber,
  SubscriberSchema,
} from 'src/subscribers/schemas/subscriber.schema';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('HOST_MAIL'),
          secure: false,
          auth: {
            user: configService.get<string>('MAIL_AUTH_ACCOUNT'),
            pass: configService.get<string>('MAIL_AUTH_PASS'),
          },
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: Subscriber.name, schema: SubscriberSchema },
    ]),
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
