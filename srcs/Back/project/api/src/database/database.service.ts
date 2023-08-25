import { ForbiddenException, Global, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { FileGateway } from "src/chat/chat_doc.gateway";
// import { SessionStore } from "src/chat/storage.service";
import { CustomSocket } from "src/interface/success-response.interface";
import { PrismaManagerService } from "src/prisma_manager/prisma_manager.service";


@Injectable()
export class DataService{
    constructor(private prisma: PrismaManagerService,){}


    async getAll()
    {
      const usersAsc = await this.prisma.user.findMany({});
      console.log("GETALL: reponse = " + usersAsc.map((user) => user));
      console.log("Result:", JSON.stringify(usersAsc, null, 2));
      return usersAsc.map((user) => user);
    }


    async GetByMail(mail: string)
    {
      let user = await this.prisma.user.findUnique({
        where: {
          email: mail,
        }
      });
      if(user)
        return user;
      return false;
    }


    async getUser(username: string)
    {
      try{
        let user = await this.prisma.user.findUnique({
            where : {
                nickname: username,
            },
            include: {
              friends: true,
              friendships:true,
              blocklist: true,
              blacklist:true,
              invits_received: true,
              my_invits: true,
              statistic: {
                include: {
                  player_history: true,
                }
              },
            },
        });
        if(user)
            return user;
      }
      catch{
        console.log("ca va pas le sang");
      }
    }


    async SendInviteFriends(username: string, new_friend: string)
    {
      const user = await this.prisma.invitation.create({
        data: {
          username: username,
          from: username, 
          to: new_friend,
          inv_sent: {
            connect: { nickname: username },
          },
          inv_received: {
            connect: { nickname: new_friend},
          }
        }
      });
      if(user)
        return true;
      else
        return false;
      // const friend = await this.prisma.
    }

    async getFriends(username: string)
    {
        const user = await this.getUser(username);
        if(!user.friends.length)
            return null;
            // throw new ForbiddenException('No friends for this user;');
        console.log(user.friends);
        return user.friends;
    }

    async getBlockedUser(username: string)
    {
        const user = await this.getUser(username);
        if(!user.blacklist.length)
              return null
            // throw new ForbiddenException('No blocklist for this user');
        console.log(user.blacklist);
        return user.blacklist;
    }
    
    async DeleteInvite(username: string, newFriend: string)
    {
      const deletedInvitations = await this.prisma.invitation.deleteMany({
        where: {
          OR: [
            { from: username, to: newFriend },
            { from: newFriend, to: username },
          ],
        },
      });
    }


    async addNewFriend(username: string, friend: string)
    {
        const user = await this.getUser(username);
        const bff = await this.getUser(friend);

        let already_friends = await this.prisma.friends.findFirst({
          where : {
              userId: user.nickname,
              friendId: bff.nickname,
          },
        });
        const already_blocked = await this.prisma.blockedUsers.findFirst({
          where:{
            userId: bff.nickname,
            blockerId: user.nickname,
          },
        })
        if(already_friends || already_blocked)
          return;
          //USer list create
        await this.prisma.friends.create({
          data: {
            userId: user.nickname,
            friendId: bff.nickname,
          },
        });
        //Friend list create
        await this.prisma.friends.create({
          data: {
            userId: bff.nickname,
            friendId: user.nickname,
          },
        });
        await this.DeleteInvite(username, friend);
  };

    async addNewBlockedUser(username: string, blocked: string)
    {
        const user = await this.getUser(username);
        const blk = await this.getUser(blocked);

        const already_blocked = await this.prisma.blockedUsers.findFirst({
          where:{
            userId: user.nickname,
            blockerId: blk.nickname,
          },
        })
        console.log(already_blocked);
        if(!already_blocked)
        {
          const the_blocker = await this.prisma.blockedUsers.create({
            data: {
              userId: user.nickname,
              blockerId: blk.nickname,
            },
          });
          this.getBlockedUser(username);
          this.deleteFriend(username, blocked);
          this.deleteFriend(blocked, username);
        }
    }

    async deleteFriend(username: string, byefriend: string)
    {
      let already_friends = await this.prisma.friends.findFirst({
        where : {
            userId: username,
            friendId: byefriend,
        },
      });
      if(already_friends)
      {

        await this.prisma.friends.delete({
          where: {
            userId_friendId:{
              userId: username,
              friendId: byefriend,
            },
          },
        });
      }

    }

    async deleteBlockedUser(username: string, blockedUser: string)
    {
      const already_blocked = await this.prisma.blockedUsers.findFirst({
        where:{
          userId: username,
          blockerId: blockedUser,
        },
      })
      if(!already_blocked)
        return;
      const bon = await this.prisma.blockedUsers.delete({
        where: {
          userId_blockerId:{
            userId: username,
            blockerId: blockedUser,
          },
        },
      })
    }

    async UpdateStatus(newstatus: string, id: string)
    {
      const the_user = await this.prisma.user.findFirst({
        where: { nickname: id},
      })
      if(!the_user)
        return;
      const user = await this.prisma.user.update({
        where: { email: the_user.email,},
        data: {
          status: newstatus,
        },
      });
    }

    async ChangeNicknameEverywhere(old_nickname:string, newnickname: string, email: string)
    {
      await this.prisma.gameInstance.updateMany({
        where: {
          user_nickname: old_nickname,
        },
        data: {
          user_nickname: newnickname,
        }
      });

      await this.prisma.match_History.updateMany({
        where: {
              player_nickname: old_nickname,
        },
        data: {
          player_nickname: newnickname,
        }
      });

      await this.prisma.match_History.updateMany({
        where: {
              opponent_nickname: old_nickname,
        },
        data: {
          opponent_nickname: newnickname,
        }
      });

      await this.prisma.friends.updateMany({
        where: {
          userId: old_nickname,
        },
        data: {
          userId: newnickname,
        }
      });

      await this.prisma.friends.updateMany({
        where: {
          friendId: old_nickname,
        },
        data: {
          friendId: newnickname,
        }
      });


      await this.prisma.blockedUsers.updateMany({
        where: {
          userId: old_nickname,
        },
        data: {
          userId: newnickname,
        }
      });
      
      await this.prisma.blockedUsers.updateMany({
        where: {
          blockerId: old_nickname,
        },
        data: {
          blockerId: newnickname,
        }
      });

      await this.prisma.invitation.updateMany({
        where: {
          OR: [
            { username: old_nickname, },
            { from: old_nickname, },
            { to: old_nickname, }
          ]
        },
        data: {
          username: newnickname,
          from: newnickname,
          to: newnickname,
        }
      });

      await this.prisma.message.updateMany({
        where: {
          from_id: old_nickname,
        },
        data: {
          from_id: newnickname,
        }
      });

      await this.prisma.message.updateMany({
        where: {
          to: old_nickname,
        },
        data: {
          to: newnickname,
        }
      });

      // const check = await this.SessionStore.findNickname(old_nickname);
      // if(check)
      // {
        // try{
        //   const newi = await this.prisma.session.update({
        //    where: {
        //      username: old_nickname,
        //    },
        //    data: {
        //      username: newnickname,
        //    }
        //  });
        //  if(newi)
        //  {
        //     let newi_socket : Socket ;
        //     newi_socket.handshake.auth.username = newi.username;
        //     newi_socket.emit("stop_waiting");
        //  }
        // }catch{
        //   console.log("BAh pas encore de session");
        // }
       
      // }

      await this.prisma.chat.updateMany({
        where:{
          owner_group_chat: old_nickname,
        },
        data: {
          owner_group_chat: newnickname,
        }
      })
      const dms = await this.prisma.chat.findMany({
        where: {
          type : "dm",
        }
      });
      if(dms)
      {
        dms.forEach(async(dm) => {
          const splitted = dm.chat_name.split("_dm_");
          const index = splitted.findIndex(item => item === old_nickname);
          if(index !== -1)
          {
            let name_dm = index === 0 ? (
              newnickname + "_dm_" + splitted[1]
            ) : (splitted[0] + "_dm_" + newnickname);
            console.log("Old chat_name " + dm.chat_name);
            console.log("New chat_name " + name_dm);
            await this.prisma.chat.update({
              where: {
                chat_name: dm.chat_name,
              },
              data: {
                chat_name: name_dm,
              },
            });
          }
        })
      }
    }


    //param id or nickname of the user and which table
    
    //create data

    //update data

    //get data
}
