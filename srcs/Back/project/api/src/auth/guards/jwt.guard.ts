import { AuthGuard } from "@nestjs/passport";
import { JwtStrategy } from "../strategy";
import { JwtService } from "@nestjs/jwt";
import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export class JwtGuard extends AuthGuard('jwt_access_token') implements CanActivate{
    constructor(){
        super();
    }

    canActivate(context: ExecutionContext) {
        console.log("JwtGuard for Access_Token")
        return super.canActivate(context);
    }

}

export class JwtRefreshGuard extends AuthGuard('jwt_refresh_token') implements CanActivate{
    constructor(){
        super();
    }

    canActivate(context: ExecutionContext) {
        // const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        // const user = request.user;
        console.log("JwtRefreshGuard")
        return super.canActivate(context);
    }

}