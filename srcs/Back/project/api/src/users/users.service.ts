import { ForbiddenException, Global, Injectable } from "@nestjs/common";
import { info } from "console";
import { Request } from "express";
import { DataService } from "src/database/database.service";
import { PrismaManagerService } from "src/prisma_manager/prisma_manager.service";



@Injectable()
export class UserService{
    constructor(private prisma: PrismaManagerService, private data: DataService){}

    async UsersFilter(user_list: any, me: any){
        console.log("UserFilter: " + me.nickname);
        const result : any[] = [];

        const about_me = await this.data.getUser(me.nickname); 
        const friend_list = await this.data.getFriends(me.nickname);
        console.log(friend_list);
        const blocked_list = await this.data.getBlockedUser(me.nickname);
        console.log(blocked_list);

        user_list.forEach(element => {

            let data = {};
            console.log(element.nickname);
            let Friend = false;
            let Blocked = false;
            let ImBloqued = false;
            let Invite_send = false;
            let Invite_received = false;
            
            if(friend_list)
                Friend = friend_list.some((friend) => friend.friendId === element.nickname);
            if(blocked_list)
                Blocked = blocked_list.some((blocked) => blocked.blockerId === element.nickname);
            if(about_me.blocklist)
                ImBloqued = about_me.blocklist.some((me) => me.userId === element.nickname)
            if(about_me.invits_received)
                Invite_send = about_me.invits_received.some((me) => me.from === element.nickname)
            if(about_me.my_invits)
                Invite_received = about_me.my_invits.some((me) => me.to === element.nickname)

            data = {
              user: element.nickname,
              status: element.status,
              avatar: element.avatar,
              isFriend : Friend,
              isBlocked: Blocked,
              ImBloqued: ImBloqued,
              Already_invite: Invite_send,
              Already_send : Invite_received,
            };

            if(element.nickname !== me.nickname)
            {
                
                result.push(data);
            }
        });
//   console.log("Result:", JSON.stringify(result, null, 2));
        // return JSON.stringify(result, null, 2);
        return result;
        
    }

    

}
