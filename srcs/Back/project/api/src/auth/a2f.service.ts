import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { Injectable } from '@nestjs/common';
import { PrismaManagerService } from 'src/prisma_manager/prisma_manager.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { totp } from 'notp';

@Injectable()
export class TwoFactorAuthenticationService {
    constructor(private prisma: PrismaManagerService, private config: ConfigService){}
    // private initVector = crypto.randomBytes(16);
    private initVector = Buffer.from('c6e34a01c657b2b403a6878f5039578d', 'hex'); //A stocker dans l'env 
    // private Securitykey = crypto.randomBytes(32);
    // private Securitykey = crypto.randomBytes(32);
    private Securitykey = Buffer.from('ca48b36c800c7376d99f6080bbcc6fe28f2a2459886aa2041180abfc2d6d9ad4', 'hex'); //A stocker dans l'env
    private algorithm = 'aes-256-cbc';
    private key = 'YourSecretKey';
    
    async checkUser(user_mail: string){
      const user = await this.prisma.user.findUnique({
        where:{
            email: user_mail,
        },
        select:{ 
            password_A2f: true,
        }
    })
    if(user.password_A2f)
        return user.password_A2f;
    // if(user.password_A2f)
    // {
    //     return user.password_A2f;
    // }
    return false;
  }

  encrypt(text: string): string{
   
    const cipher = crypto.createCipheriv(this.algorithm, this.Securitykey, this.initVector);

    let encryptedData = cipher.update(text, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return encryptedData;
  }

  decrypt(encryptedText: string): string {
    console.log(this.initVector);
    console.log(this.Securitykey);
    const decipher = crypto.createDecipheriv(this.algorithm, this.Securitykey, this.initVector);
    let decryptedData = decipher.update(encryptedText, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    console.log("Decrypted message: " + decryptedData);
    return decryptedData;
  }

  async generateSecretKey(info: any): Promise<string> {
    const secret = speakeasy.generateSecret(); //For Yangchi is already hashed so no need
    console.log('secret base32 = ' + secret.base32)
    const hash = this.encrypt(secret.base32);
    console.log('Secret hashed = ' + hash)
    const user = await this.prisma.user.update({
        where: {
            email: info.email,
        },
        data: {
            password_A2f: hash, 
        }
    })
    return secret.base32;
  }

  async generateQrCode(username: string, secretKey: string): Promise<string> {
    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secretKey,
      label: username,
      issuer: 'Your App',
    });
    const qrCode = await qrcode.toDataURL(otpAuthUrl);
    // return qrCode;
    const qrCodeImageBuffer = await qrcode.toBuffer(otpAuthUrl);
    const qrCodeDataUrl = `data:image/png;base64,${qrCodeImageBuffer.toString('base64')}`;

    return qrCodeDataUrl;
  }


  async verifyOtp(secretKey: string, otp: string): Promise<boolean> {
    const key = this.decrypt(secretKey);
    // const key = "ENUHKLDQJJFVQPTCOFHUIVB4PM6FE4SENNYHSVJQOV5HMNZWKBKA"
    // console.log("Into verifyOtp, secretkey = " + key);
    console.log("on a decrypte")
    // const verified = speakeasy.totp.verify({
    //   secret: key,
    //   encoding: 'base32',
    //   token: otp,
    //   step:600,//10 mins
    //   window:1,
    // });
    // const verified = authenticator.verify({
    //   token: otp,
    //   secret: key,
    // })
    const verified = totp.verify(otp, key);
    console.log("Result of verifyOtp = " +  verified);
    if(verified)
    {
      console.log('A2f carre');
      return true;
    }
    else
      return false;
    // return verified;
  }

  async deleteA2f(username: string)
  {
    const user = await this.prisma.user.update({
      where: {
        nickname: username,
      },
      data: {
        password_A2f: null,
      },
    });
    if(user)
      return user;
    else 
      return false;
  }



}
