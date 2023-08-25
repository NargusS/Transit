import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { JwtGuard } from '../guards';
// import jwt, { JwtPayload, decode } from 'jsonwebtoken';
import { Request, response } from 'express';
import { ExpiredToken } from '../guards/expiredToken.exception';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { error } from 'console';
import * as jwt from 'jsonwebtoken';
import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(private readonly guard: JwtGuard, private config: ConfigService, private auth: AuthService) {}

  async VerifyCookie(secret: string, token: string, key: string, request: Request) : Promise<any>{
      const secreti = this.config.get(secret);
      console.log(secreti)
      const payload = jwt.verify(token, secreti, { ignoreExpiration: false }) as { email: string; nickname: string };
      if(payload)
      {
        console.log(payload)
        request.user = { email: payload.email, nickname: payload.nickname };
        console.log("on est bon la ");
        return true;
      }
      else
        return false;
     
    };

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const httpContext = context.switchToHttp();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { url } = request;

    if(request.headers.cookie)
    {
      console.log("AuthInterceptor: Cookies")
      const cookies = request.headers.cookie.split('; ');

      const hasAccessTokenCookie = cookies.find((cookie) => cookie.startsWith('accessToken='));
      const hasRefreshTokenCookie = cookies.find((cookie) => cookie.startsWith('refreshToken='));
      const refreshToken = await hasRefreshTokenCookie ? hasRefreshTokenCookie.split('=')[1] : '';
      const accessToken = hasAccessTokenCookie ? hasAccessTokenCookie.split('=')[1] : '';
      

            if(hasAccessTokenCookie)
            {
              try{
                    // const secret = this.config.get('JWT_SECRET');
                    // const payload = jwt.verify(accessToken, secret, { ignoreExpiration: false } ) as { email: string; nickname: string };
                    // if(payload)
                    // {
                    //   request.user = { email: payload.email, nickname: payload.nickname };
                    //   return next.handle();
                    // }  
                    console.log("check access")
                    const check = await this.VerifyCookie("JWT_SECRET", accessToken, "accessToken", request);
                    if(check)
                    {
                      return next.handle();
                    }
              }catch{
                console.log('AccessToken expired')
                await this.auth.deleteCookies(response, "accessToken", accessToken);
                console.log("on commence ")
                // const secreti = await this.config.get('JWT_REFRESH_SECRET');
                // console.log(secreti)
                // try{
                  // const payload = await jwt.verify(refreshToken, secreti, { ignoreExpiration: false }) as { email: string; nickname: string };
                  // console.log(payload);
                  // console.log(refreshToken)
                  // if(payload)
                // }
                // catch{
                // }
              }
            }
            if(hasRefreshTokenCookie)
            {
              try{
                const check = await this.VerifyCookie("JWT_REFRESH_SECRET", refreshToken, "refreshToken", request);
                if(check)
                    await this.auth.verifyRefreshToken(request.cookies, {email: request.user.email, nickname: request.user.nickname}, response);
              }catch{
                throw new ExpiredToken('Unvalid refreshToken', {key: "refreshToken", value: refreshToken});
              }
            }
            else
                throw new ExpiredToken('Unvalid refreshToken', {key: "refreshToken", value: refreshToken});
    }
    if(!request.headers.cookie)
    {
      console.log("AuthInterceptor: No cookies")
      if(!url.includes('/auth/42'))
      {
        //if don't have access_token then move out and login again

        console.log("Different routes =" + url)
        throw new ExpiredToken('Unvalid refreshToken', {key: "refreshToken", value: ""});
      }
    }
    return next.handle();
  }
}