import { ForbiddenException, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy} from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaManagerService } from "src/prisma_manager/prisma_manager.service";
import { Request } from "express";

/* Jwt is the token*/



// @Injectable() //only people with a valid token can access to this strategy
// export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt_access_token')
// {
//     //I don't know when I have to use private or not
//     constructor(config: ConfigService, private prisma: PrismaManagerService){
//         super({
//             jwtFromRequest: ExtractJwt.fromExtractors([
//                 ExtractJwt.fromAuthHeaderAsBearerToken(),
//                 ExtractJwt.fromUrlQueryParameter('token'),
//                 // (req) => req.cookies['Access_token'],
            
//               ]),
//             secretOrKey: config.get('JWT_SECRET'), //mettre plusieurs secret
//         });
//     }

//     async validate(payload: {sub: number, email: string})
//     {   
//         const user = await this.prisma.user.findUnique({
//             where:{
//                 email: payload.email,
//             },
//         });
//         return user; //If the user is found then the user object will be appended on the request 
//     }
// }

//15h20

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt_access_token') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWTFromCookie,
      ]),
      ignoreExpiration: false,
        secretOrKey: config.get('JWT_SECRET'),
        });
    }

  private static extractJWTFromCookie(req: Request): string | null {
    if (req.cookies && req.cookies.accessToken) {
        console.log("Accesstoken =" + req.cookies.accessToken);
      return req.cookies.accessToken;
    }
    console.log("No AccessToken cookies")
    return null;
  }

  async validate(payload: any) {
    console.log("Validate Access Token for: " + payload.nickname)
    return { email: payload.email , nickname: payload.nickname };
  }
}