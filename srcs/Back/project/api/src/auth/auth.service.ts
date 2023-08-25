import { ForbiddenException, Injectable, Res,  Req, HttpStatus} from '@nestjs/common';
import { PrismaManagerService } from 'src/prisma_manager/prisma_manager.service';
import { AuthDto } from './dto';
// import * as argon from 'argon2';
import * as argon2 from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { access } from 'fs';
import { Response, Request, response } from 'express';
import { Cookies, GetUser } from './decorator';
import { error, info } from 'console';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { DataService } from 'src/database/database.service';
// const speakeasy = require('speakeasy');
// const qrcode = require('qrcode');

@Injectable()
export class AuthService {
    constructor(private config: ConfigService, 
        private prisma: PrismaManagerService, private jwt: JwtService,
        private db: DataService){}

    async updateToken(dto: any, res: Response)
    {
        const refresh_token = await this.signToken(dto.nickname, dto.email, "2w", "Refresh_Token", 'JWT_REFRESH_SECRET', res)
        const hash = await argon2.hash(refresh_token); //to securize the token
        // Utiliser un interface pour les creer les cookies et les envoyer ailleurs
        const updatedUser = await this.prisma.user.update({
            where: { email: dto.email }, 
            data: {
                refreshtoken: hash,
                status: "online",
             },
             select: {
                email: true,
                login: true,
                nickname: true,
                password_A2f: true
            },
        });
        const access_token = await this.signToken(dto.nickname, dto.email, "3h", "Access_token", 'JWT_SECRET', res);
        await this.sendCookie(res, 'refreshToken', refresh_token);
        await this.sendCookie(res, 'accessToken', access_token);
        return updatedUser;
    }


    async signin(dto: any, res: Response){
        // const refresh_token = await this.signToken(dto.nickname, dto.email, "2w", "Refresh_Token", 'JWT_REFRESH_SECRET', res)
        // const hash = await argon2.hash(refresh_token); //to securize the token
        // // Utiliser un interface pour les creer les cookies et les envoyer ailleurs
        // const updatedUser = await this.prisma.user.update({
        //     where: { email: dto.email }, 
        //     data: {
        //         refreshtoken: hash,
        //         status: "online",
        //      },
        //      select: {
        //         email: true,
        //         login: true,
        //         nickname: true,
        //         password_A2f: true
        //     },
        // });
        // const access_token = await this.signToken(dto.nickname, dto.email, "3h", "Access_token", 'JWT_SECRET', res);
        // await this.sendCookie(res, 'refreshToken', refresh_token);
        // await this.sendCookie(res, 'accessToken', access_token);
        let updatedUser = await this.updateToken(dto, res);
        if(updatedUser.password_A2f)
        {
            console.log(updatedUser.password_A2f);
            const final = "http://" + process.env.POST_LOCAL + ":" + process.env.PORT_FRONT + "/a2f";
            res.redirect(final);
        }
        else
        {  
            // res.status(201).json({
            //     message: "Connected",
            // });
            const final = "http://" + process.env.POST_LOCAL + ":" + process.env.PORT_FRONT + "/home";
            res.redirect(final);
        }
            
            /*Ici j'ai testé des solutions qui permettent de plus avoir de pb avec le front 
            mais du coup j'ai des exceptions dans le back, c'est TypeError qui changent tous le tps
            et du coup ca envoie un reponse qui est une exception avec c'est header et donc le redirect
            ne fonctionne pas 
            
            Ca fonctionne que avec response de express pas avec le res que je passe en param


            response.setHeader('Access-Control-Allow-Origin', "http://localhost:8000");
            // res.header();
            response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            response.header('Access-Control-Expose-Headers', 'X-Custom-Header');
            response.header('Access-Control-Allow-Credentials', 'true');
            response.header('Access-Control-Max-Age', '3600');
            response.redirect("http://localhost:8000/home");
            */
        // }
    }

    //create user
    async signup(dto: any, res: Response){ //Create User Good but problem with cookies
        try{
            const refresh_token = await this.signToken(dto.nickname, dto.email, "2w", "Refresh_Token", 'JWT_REFRESH_SECRET', res)
            const hash = await argon2.hash(refresh_token);
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    login: dto.nickname,
                    refreshtoken: hash,
                    status: "online",
                },
            });
            const access_token = await this.signToken(dto.nickname, dto.email, "3h", "Access_token", 'JWT_SECRET', res);
            await this.sendCookie(res, 'refreshToken', refresh_token);
            await this.sendCookie(res, 'accessToken', access_token);
            const final = "http://" + process.env.POST_LOCAL + ":" + process.env.PORT_FRONT + "/register";
            res.redirect(final);
        }
        catch(error)
        {
            if(error instanceof PrismaClientKnownRequestError)
            {
                if(error.code === 'P2002')
                {
                    throw new ForbiddenException('Credentials taken',);
                }
            }
            throw error;
        }
    }

    //Problem Cookie and Insomnia
    async signToken(nickname: string, email: string,time: string, token_type: string, secret:string, res: Response) : Promise<string> //extract by the jwt
    {
        const payload = { nickname, email}; //convention unique identify
        const token_secret = await this.config.get(secret) //jwt_secret is a key available in .env 
        const token = await this.jwt.signAsync(payload, 
        {
            expiresIn: time, //after that you have to signin again
            secret: token_secret,
        });
        console.log("signToken")
        return token;
    }
    
    async isUserLoggedIn(info: any, @Res() res: Response) //bon
    {
        let user = await this.prisma.user.findUnique({
            where : {
                email: info.email,
            },
        });
        if(!user)
            return this.signup(info, res);
        else
        {
            info.nickname = user.nickname;
            return this.signin(info, res);
        }
    }

    async createNickname(newnickname : string, usermail: string) //bon
    {
        let old_nickname = newnickname;
        const me = await this.prisma.user.findUnique({
            where: {email: usermail}
        });
        if(me.nickname)
            old_nickname = me.nickname;
        const check = await this.prisma.session.findUnique({
            where: {
                username: old_nickname,
            },
        });
        if(check)
        {
            try{

                const user = await this.prisma.user.update({
                    where: {
                        email: usermail,
                    },
                    data:{
                        nickname: newnickname,
                        session_list: {
                            connect: {
                                username: newnickname,
                            }
                        }
                    }, 
                });
                if(user){
                    await this.db.ChangeNicknameEverywhere(old_nickname, newnickname, usermail);
                    return user;
                }
            }
            catch{
                console.log("Meme nickname");
                // throw new ForbiddenException("Nickname in use");
                return false;
            }
        }
        else
        {
            try{

                const user = await this.prisma.user.update({
                    where: {
                        email: usermail,
                    },
                    data: {
                        nickname: newnickname,
                    }
                });
                if(user)
                {
                    await this.db.ChangeNicknameEverywhere(old_nickname, newnickname, usermail);
                    return user; 
                }
            }
            catch{
                console.log("Meme nickname")
                // throw new ForbiddenException("Nickname in use")
                return false;
            }
        }
            // else
        //     return "Nickname not unique";
    }

    async createAvatar(usermail: string, avatar: string)
    {
        const user = await this.prisma.user.update({
            where: {
             email: usermail,
            },
            data:{
             avatar: avatar,
             }, 
         });
         if(user)
             return user;
    }

    //It works
    async verifyRefreshToken(data: any, user: any, res: Response) 
    {
        console.log("On vient d'arriver le sang")
        const user_log = await this.prisma.user.findUnique({
            where:{
                email: user.email,
            },
            select:{
                refreshtoken: true,
            }
        });
        if(user_log.refreshtoken)
        {
            console.log("on fait nos petits tests tranquille")
            console.log(data.refreshToken);
            console.log(user_log.refreshtoken);
            // let hashRefreshTok = await argon2.hash(data.refreshToken);
            // let a = await argon2.verify(hashRefreshTok, user_log.refreshtoken);
            let test = await argon2.verify(user_log.refreshtoken, data.refreshToken);
            if(test)
            {
                console.log('Le refresh Token est verifie')
                    const access_token = await this.signToken(user.nickname, user.email, "3h", "access_token", 'JWT_SECRET', res);
                    console.log("New Accessaccess_token = " + access_token)
                    await this.sendCookie(res, 'accessToken', access_token);
                    await this.sendCookie(res, 'refreshToken', data.refreshToken);
                    console.log("Tout est bg ")
                    return true;
            }
        }
        console.log("On s'apprete a log out ");
        await this.logoutAll(user.email, res);
    }


    async logoutAll(mail: string, res: Response) //bon
    {
        let user = await this.prisma.user.update({
            where:{
                email: mail,
            },
            data:{
                refreshtoken: null,
                status: "offline",
            },
        })
        this.deleteCookies(res, 'accessToken', "");
        this.deleteCookies(res, 'refreshToken', "");
    }

    async sendCookie(res: Response, key: string, value: string)
    {
        res.cookie(key, value, {
            httpOnly: false, //Because react need to use it too
            maxAge: 14 * 24 * 60 * 60 * 1000,
          })
        //   res.cookie(key, value, {
        //     httpOnly: true, //Because react need to use it too
        //     sameSite: 'none',
        //     secure: true,
        //     maxAge: 14 * 24 * 60 * 60 * 1000,
        //   })
    }

    async deleteCookies(res: Response, key: string, value: string)
    {
        res.cookie(key, value, {
            httpOnly: false, //Because react need to use it too
            maxAge: 1,
          })
    }


    async checkToken(token : string){
        const final = await this.jwt.verify(token);
      
    }
}
