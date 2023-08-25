import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get('auth/42')
  // @UseGuards(AuthGuard('42'))
  // async login42(){

  // }

  // @Get('auth/42/callback')
  // @UseGuards(AuthGuard('42'))
  // async login42Callback(@Req() req) /*: Promise<string>*/
  // {
  //   return 'Hello World!';
  //   console.log(req.user);
  // }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
