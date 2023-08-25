import { Catch, ExceptionFilter, ArgumentsHost, UnauthorizedException, ForbiddenException, HttpException, HttpStatus, Post } from '@nestjs/common';
import { SuccessResponse } from 'src/interface/success-response.interface';
import { ExpiredToken } from './expiredToken.exception';
import axios from 'axios';
import { AuthService } from '../auth.service';

@Catch()
export class GuardExceptionFilter implements ExceptionFilter {
  
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Handle specific exceptions from guards or strategies
    if(exception)
    {
        if (exception instanceof UnauthorizedException ) {
            console.log('Unautho')
            console.log(exception.constructor.name)
            console.log(exception)
          // Custom error response for unauthorized access
          response.status(401).json({
            message: 'Unauthorized by me',
          });
        } else if (exception instanceof ForbiddenException) {
          // Custom error response for forbidden access
          
          response.status(403).json({
            message: exception.message,
          });
          
        } else if (exception instanceof ExpiredToken ) {
          if(exception.getResponse() === "Unvalid refreshToken")
          {
            console.log('finito')
            response.cookie(exception.getData().key, exception.getData().value, {
              httpOnly: false, //Because react need to use it too
              sameSite: 'none',
              maxAge: 1,
            })
            const final = "http://" + process.env.POST_LOCAL + ":" + process.env.PORT_FRONT;
            response.redirect(final);
          }
          // response.status(403).json({
          //   message: 'ExpiredToken by me',
          // });

        }
        else {
          // Default error response for other exceptions
          console.log(exception.constructor.name)
          console.log(exception)
          // response.status(500).json({
          //   message: 'Internal Server Error by me',
          // });
        }
    }
    else
    {
      console.log('finito pipo');
      // response.status(this.success.status).json(this.success);
    }
  }
}