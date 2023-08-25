import { Controller, Get, Param, Post, Req, UseGuards, Query, Inject, Delete, Res, Body} from "@nestjs/common";
import { GetUser } from "src/auth/decorator";
import { DataService } from "src/database/database.service";
import { Response, Request} from "express";
import { UserService } from "./users.service";


@Controller('users')
export class UserController{
    constructor(private data: DataService, private service: UserService){
    }
    // @Get('me') //To work the request must send the jwt tokens generated in signup or signin (if refresh token) function
    // // @UseGuards(IntraGuard) 
    // getMe(@GetUser() user: User){
    //     /* Req values provide from the validate function in jwt.strategy.ts */
    //     console.log('me');
    //     console.log(user);
    //     return user;
    // }

    /* I have to put return Values or HTTP STATUS not string */

    @Post()
    async getMe(@GetUser('nickname') username: string,  @Body() info: any,@Res() res: Response)
    {   
        console.log(username);
        const data = await this.data.getUser(info.nickname);
        if(data)
        {
            console.log("Elle existe ta data frrr");
            return data;
        }
        return false;
    }

    @Get('all')
    async getAll(@Req() req: Request, @Res() res: Response)
    {
        console.log("GETALL: beging");
        let data = await this.data.getAll();
        // res.status(201).json({
        //         message: "Connected",
        //     });
        let final_rep = await this.service.UsersFilter(data, req.user);
        return final_rep;
    }

    @Post('friends') 
    async getFriends(@GetUser('nickname') username: string, @Body() info: any,)
    {
        if(info.friendName)
            return await this.data.addNewFriend(username, info.friendName);
        else
            return await this.data.getFriends(username);
    }

    @Post('block')
    getBlockedUser(@GetUser('nickname') username: string, @Body() info: any,)
    {
        if(info.blockedUser)
            return this.data.addNewBlockedUser(username, info.blockedUser);
        else
            return this.data.getBlockedUser(username);
    }

    @Delete('deblock')
    async getDeblockUser(@GetUser('nickname') username: string, @Body() info: any)
    {
        return await this.data.deleteBlockedUser(username, info.deblockUser);
        // return (info.deblockUser + ' is not blocked anymore ');
    }

    @Delete('deletefriend')  
    async getDeletefriend(@GetUser('nickname') username: string, @Body() info: any)
    {
        await this.data.deleteFriend(username, info.byefriend);
        return await this.data.deleteFriend(info.byefriend, username);
        
        // return (info.byefriend + ' is not your friend anymore');
    }

    @Post('invitefriend')
    async handleInviteFriends(@GetUser('nickname') username: string, @Body() info: any)
    {
        console.log("INviteFriend :" + info.nickname);
        await this.data.SendInviteFriends(username, info.nickname);
    }

    // @Get()
    // getMe(@Param('username') username: string)
    // {
    //     return this.data.getUser(username);
    // }

    // @Get('friends') 
    // getFriends(@Param('username') username: string, @Query('friendName') friendName: string,)
    // {
    //     if(friendName)
    //         return this.data.addNewFriend(username, friendName);
    //     else
    //         return this.data.getFriends(username);
    // }

    // @Get('block')
    // getBlockedUser(@Param('username') username: string, @Query('blockedUser') blockedUser: string,)
    // {
    //     if(blockedUser)
    //         return this.data.addNewBlockedUser(username, blockedUser);
    //     else
    //         return this.data.getBlockedUser(username);
    // }

    // @Delete('deblock/:deblockUser')
    // getDeblockUser(@Param('username') username:string, @Param('deblockUser') deblockUser:string)
    // {
    //     this.data.deleteBlockedUser(username, deblockUser);
    //     return (deblockUser + ' is not blocked anymore ');
    // }

    // @Delete('deletefriend/:byefriend')  
    // getDeletefriend(@Param('username') username:string, @Param('byefriend') byefriend:string)
    // {
    //     this.data.deleteFriend(username, byefriend);
    //     return (byefriend + ' is not your friend anymore');
    // }
}

//Haumanava1993!!

/*@UseGuards(AuthGuard('jwt')) 
Guard compatible with nestjs, Auth is regarding the strategy jwt
But the syntax can make errors (when you put a string like this) and it's not clean
Instead we create a custom guard jwt.guard.ts*/

/*In the @getMe(@Req() req: Request) we wanted to have our user from req.user, 
we know that will need to have infos from user, 
then we have create our decorator that returns user. 
@GetUser() user: User we have no param so the type is User(from prisma) 
if we put @GetUser('email') val: string and change my decorator 
then we can choose if we want to be specific or not. */  

/* @Get('friends)*/
/* If you want to add a new friend then the url will be domain/users/:username/friends?friendName=John 
If you want the friendlist then the url will be /api/users/:username/friends 
And username will be replace by the name of my user 
Is the same for deblock */

/* @Delete(deblock/:deblockUser) or @Post('deletefriend/:byefriend') 
Both work in the same way, the url must be example: deblock/amattei */ 

/* I didn't check if you future friend or blockedUSer exist 
because the client will not have the choice to add/block a client that not exist. */
