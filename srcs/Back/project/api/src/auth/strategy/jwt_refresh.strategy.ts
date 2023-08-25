import { ForbiddenException, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy} from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaManagerService } from "src/prisma_manager/prisma_manager.service";
import { Request } from "express";

// @Injectable() //only people with a valid token can access to this strategy
// export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt_refresh_token')
// {
//     //I don't know when I have to use private or not
//     constructor(config: ConfigService, private prisma: PrismaManagerService){
//         super({
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//             secretOrKey: config.get('JWT_REFRESH_SECRET'),
//             passReqToCallback: true,
//         });
//     }

//     async validate(req: Request, payload: any)
//     {   
        
//     }
// }

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt_refresh_token') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshStrategy.extractJWTFromCookie,
      ]),
      ignoreExpiration: false,
    //   secretOrKey: jwtConstants.secret,
        secretOrKey: config.get('JWT_REFRESH_SECRET'),
        });
    }

  private static extractJWTFromCookie(req: Request): string | null {
    if (req.cookies && req.cookies.refreshToken) {
        console.log("RefreshToken = " + req.cookies.refreshToken);
      return req.cookies.refreshToken;
    }
    console.log('RefreshStrategy: No refresh Token Cookies ');
    return null;
  }

  async validate(payload: any) {
    console.log('Validate JwtRefrehStrategy for ' + payload.nickname);
    return { email: payload.email , nickname: payload.nickname };
  }
}