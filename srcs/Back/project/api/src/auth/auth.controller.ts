import { Controller, Post, Get, Body, Req, Res, UseGuards, Delete, Param, Redirect} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthDto } from './dto';
import { JwtRefreshGuard } from './guards';
import { Cookies, GetUser } from './decorator';
import { Response, Request } from 'express';
import { response } from 'pactum';
import { TwoFactorAuthenticationService } from './a2f.service';
import { SuccessResponse } from 'src/interface/success-response.interface';
import { ConfigService } from '@nestjs/config';
// import * as axios from 'axios';
// const axios = require('axios'); 
import axios from 'axios';
import { DataService } from 'src/database/database.service';
import { config } from 'dotenv';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, 
        private a2fService: TwoFactorAuthenticationService, 
        private config: ConfigService, private db: DataService){}
    
    @Get('signin')
    signin(@Body() dto: AuthDto, @Res() res: Response){
        return(this.authService.signin(dto, res));
    }

    @Post('signup')
    signup(@Body() dto: AuthDto, @Res() res: Response){
        return(this.authService.signup(dto, res));
    }

    @Get('/42')
    async login42(@Req() req: Request, @Res() res: Response) {
       console.log('42');
       const id = process.env.CLIENT_ID;
       const secret = process.env.CLIENT_SECRET;
       const call_url = process.env.CALLBACK_URL
       const a =  await this.config.get('CLIENT_ID');
       const b = await this.config.get('CLIENT_SECRET');
       const c = await this.config.get('CALLBACK_URL');
       
       res.redirect(`https://api.intra.42.fr/oauth/authorize?client_id=${a}&redirect_uri=${c}&response_type=code`)
    }
    
    @Get('42/callback')
    async connect_to_42(@Req() req: Request, @Res() res: Response)
    {
        console.log('42 callback')
        console.log(req.query.code)
        // console.log("")
        const response = await axios.post('https://api.intra.42.fr/oauth/token', { 
                client_id: await this.config.get('CLIENT_ID'), 
                client_secret: await this.config.get('CLIENT_SECRET'),
                grant_type: "authorization_code",
                code: req.query.code,
                redirect_uri: await this.config.get('CALLBACK_URL'),
            });
            // console.log(response);
        const accessToken = response.data.access_token;
        console.log("tok =" + accessToken);
        const userResponse = await axios.get('https://api.intra.42.fr/v2/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        // console.log(userResponse);

        const dto: AuthDto = new AuthDto();
        dto.email = userResponse.data.email;
        dto.nickname = userResponse.data.login;
        this.authService.isUserLoggedIn(dto, res);       
    }

    // @Post('refresh') //it works
    //@UseGuards(JwtRefreshGuard) //if refresh token invalid then signin again
    // async new_access_token(@Cookies() data: any, @Res() res: Response, @GetUser() user: any)
    // {
        // console.log('Refresh Function');
        // if(this.authService.verifyRefreshToken(data, user.email))
        // {
        //     console.log('Le refresh Token est verifie')
        //     const access_token = await this.authService.signToken(user.nickname, user.email, "3h", "access_token", 'JWT_SECRET', res);
        //     console.log("New Accessaccess_token = " + access_token)
        //     await this.authService.sendCookie(res, 'accessToken', access_token);
        //     const test =  data.refreshToken;
        //     await this.authService.sendCookie(res, 'refreshToken', test);
        //     // res.setHeader('Access-Control-Allow-Credentials', 'http://localhost:8000');
        //     res.status(200).json({
        //         message: "Refresh successful",
        //         // accessToken: access_token.new_token,
        //         // expires_in: 14 * 24 * 60 * 60 * 1000,
        //         username: user.login,
        //       });
        // }
        // else
        // {
        //     await this.authService.logoutAll(user.email);
        //     return ("Session expired"); //Redirect to login then 
        // }
    // }

    
    // @Post('generate-a2f')
    @Post('ga2f')
    async TwofactorAuthentication(@GetUser() user: any, @Res() res: Response)
    {
        console.log('chef')
        // if(!this.a2fService.checkUser(user.email))
        // {
            console.log(user.email);
            const secret = await this.a2fService.generateSecretKey(user);
            const  qrCodeDataUrl = await this.a2fService.generateQrCode(user.nickname, secret);
            // }
            // res.set({
            //     'Content-Type': 'text/html',
            //   });
            //   res.status(200).set({
            //     'Content-Type': 'text/html',
            //   });
              
            return qrCodeDataUrl; //I send a qrcode
            
            res.send(`<img src="${qrCodeDataUrl}" alt="QR Code" />`); //I send a qrcode
            
    }


    @Post('log-a2f')
    async LogWithA2f(@GetUser() user: any, @Body() body: any)
    {
        // const { otp } = body;
        console.log('LogWithA2f')
        console.log(user.email);
        console.log('user mail')
        console.log(body.otp);
        // console.log(otp);
        //it works with non hashed password
        const password_user = await this.a2fService.checkUser(user.email)
        if(!password_user)
            return "You have to generate a password first"
        console.log("before decrypt")
        console.log(password_user);
        return await this.a2fService.verifyOtp(password_user, body.otp);
    }

    @Delete('no-a2f')
    async DeleteA2f(@GetUser() user: any)
    {
        return await this.a2fService.deleteA2f(user.nickname);
    }


    @Post('set-nickname') //good
    async sign_nickname(@Res() res: Response, @Body() info: any, @GetUser() data :any)
    {
        
        const user = await this.authService.createNickname(info.nickname, data.email);
        if(info.avatar)
            await this.authService.createAvatar(data.email,info.avatar);
        await this.authService.updateToken({nickname: info.nickname, email: data.email}, res)
        // await this.authService.signin({nickname: info.nickname, email: data.email}, res);
        return user
    } 
    

    @Get('security')
    async handleConnection(@GetUser() user: any, @Res() res: Response)
    {
        // const user = await this.prisma.findUnique({
        //     where: {

        //     }
        // }) ///ajouter avatar
    try     {
        console.log('security');
        const logged = await this.db.GetByMail(user.email);
        if(logged)
        {
            return logged;
            // res.status(201).json({
            //     nickname: logged.nickname,
            //     avatar: logged.avatar,
            //     message: "Connected",
            // });
        }
    }
    catch {
        return false;
        // console.log("Dans else security");
    }      
        // else
        // {
        //     res.status(404).json({
        //         message: "Unconnect"
        //     })
        // }
    }

    // @Delete('logout')
    @Get('logout')
    async disconnectFromApp(@GetUser() data: any, @Req() req: Request, @Res() res: Response)
    { 
       
        await this.authService.logoutAll(data.email, res);
        // res.redirect("http://localhost:8000");
    }
}

// Pipe are fonctions that transform your data 

/*
/usr/src/app/api/node_modules/@nestjs/passport/dist/auth.guard.js:69
                throw err || new common_1.UnauthorizedException();
                             ^
UnauthorizedException: Unauthorized
    at JwtGuard.handleRequest (/usr/src/app/api/node_modules/@nestjs/passport/dist/auth.guard.js:69:30)
    at /usr/src/app/api/node_modules/@nestjs/passport/dist/auth.guard.js:50:128
    at /usr/src/app/api/node_modules/@nestjs/passport/dist/auth.guard.js:92:24
    at allFailed (/usr/src/app/api/node_modules/passport/lib/middleware/authenticate.js:110:18)
    at attempt (/usr/src/app/api/node_modules/passport/lib/middleware/authenticate.js:183:28)
    at JwtStrategy.strategy.fail (/usr/src/app/api/node_modules/passport/lib/middleware/authenticate.js:305:9)
    at /usr/src/app/api/node_modules/passport-jwt/lib/strategy.js:106:33
    at /usr/src/app/api/node_modules/jsonwebtoken/verify.js:190:16
    at getSecret (/usr/src/app/api/node_modules/jsonwebtoken/verify.js:97:14)
    at Object.module.exports [as verify] (/usr/src/app/api/node_modules/jsonwebtoken/verify.js:101:10)
 
*/