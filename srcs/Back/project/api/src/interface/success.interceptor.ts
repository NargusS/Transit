import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';


@Injectable()
export class EndMethodInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        const response = ctx.switchToHttp().getResponse<Response>();
        const request = ctx.switchToHttp().getRequest();
        const { url } = request;
        // This block will run after the route handler has completed its execution
        console.log('Interceptor: Method has finished executing.');
        if(!url.includes('/auth/42') )
        {
          response.status(200).json({
            message: 'Success',
            data: data,
          });
        }
        // You can perform additional actions or modify the response here
      }),
    );
  }
}