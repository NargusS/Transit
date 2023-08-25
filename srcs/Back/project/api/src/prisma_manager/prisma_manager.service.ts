import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaManagerService extends PrismaClient{
    constructor(config:ConfigService){
        super({
            datasources:{
                db: {
                    url: config.get('DATABASE_URL'), 
                    // 'postgresql://postgres:123@database:5432/nest?schema=public'
                },
            },
        });
        // console.log(config.get('DATABASE_URL'));
        //console log is used to print in my terminal
    }

    cleanDb(){
        return this.$transaction([
            this.user.deleteMany(),
        ]);
    }
}
