import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private configService: ConfigService) {}

  @Get('home')
  @Render('home')
  getHello() {
    const message = this.appService.getHello();
    //console.log(this.configService.get<string>('PORT'), this.configService.get<string>('MONGODB_URL'))
    return {
      message: message
    }
  }
}
