import { Injectable } from "@nestjs/common";
import { channel } from "diagnostics_channel";
import { emitKeypressEvents } from "readline";
import { GroupChat, MessageForm } from "src/interface/success-response.interface";
import { PrismaManagerService } from "src/prisma_manager/prisma_manager.service";



@Injectable()
export class ChatService{
    constructor(private prisma: PrismaManagerService){}


    async FindAllChannel(){
        const Channels = await this.prisma.chat.findMany({
            where: {
              NOT: {
                type: "dm",
              },
            },
            select: {
              chat_name: true,
              type: true,
              owner_group_chat: true,
              protected: true, 
              users: true,
              admins: true,
              muted: true,
              banned: true,
              message: true,
            }
          });
        if(!Channels)
            return false;
        return Channels.map((chat) => chat);
    }

    async FindDm(friend: string, me: string)
    {
      const chat = await this.prisma.chat.findFirst({
        where: {
          type: "dm",
          AND: [
            {
              users: {
                some: {
                  username: me,
                }
              }
            },
            {
              users: {
                some: {
                  username: friend,
                }
              }
            }
          ]
        },
        select : {

          chat_name: true,
          message: true,
          users: {
            include: {
              user: {
                select: {
                  avatar: true,
                },
              },
            },
          },
        }
      });
      if(chat)
      {
        console.log(`Tes dm avec ${friend} sont ${chat}`);
        console.log(`j'existe bien ${me} = ` + JSON.stringify(chat, null, 2));
        
        return chat;
      }
    }

    async FindAllDm(me: string ){
      const Channels = await this.prisma.session.findMany({
        where: {
          username: me,
          chats: {
            some: {
              type: "dm",
            }
          }
        },
        select: {
          username: true,
          userId: true,
          connected: true,
          chats: {
            select: {
              chat_name: true,
              message: true,
              type: true,
              users: true,
            },
            where: {
              type: "dm" // Add this condition to filter chats of type "dm" only
            }
          }
        }
      });
      // const Channels = await this.prisma.chat.findMany({
      //   where: {
      //     type: "dm",
      //     users: {
      //       some: {
      //         username: me,
      //       }
      //     }
      //   },
      //   select: {
      //     chat_name: true,
      //     message: true,
      //   }
      // });
      if(!Channels)
          return false;
      console.log(`j'existe bien ${me} = ` + JSON.stringify(Channels, null, 2));
      return Channels.map((chat) => chat);
      // return Channels;
    }

     async FindChat(name_chat: string){
        const chat = await this.prisma.chat.findUnique({
            where: {chat_name: name_chat},
            include: {
              users: true,
              admins: true,
              muted: true,
              banned: true,
            }
        });
        if(chat)
        {
            // console.log("Le chat trouvé est " + chat);
            return chat;
        }
        else
            return null;
    }

    async AlreadyInTheCHat(username: string, name_chat: string)
    {
      const chat = await this.FindChat(name_chat);
      if(!chat)
        return null;
      // const adminSession = await this.prisma.chat.findUnique({
      //   where: {
      //     chat_name: name_chat,
      //   },
      //   include: {
      //     users: {
            
      //         username,
            
      //     },
      //   },
      // });
      const adminSession = chat.users.some((user) => user.username === username) 
      if(adminSession)
      {
        // console.log("AlreadyInTheChat: " + adminSession);
        return true;
      }
      // console.log("AlreadyInTheChat: Not logged")
      return false;
    }


    async CreateChat(newchat: GroupChat){
        console.log("Let's create a group chat")

        const check = await this.FindChat(newchat.name_chat);
        if(check)
        {
          console.log("CreateChat: on a trouvé ton chat")
          return false;
        }
        const new_chat = await this.prisma.chat.create({
            data: {
              chat_name: newchat.name_chat,
              type: newchat.type,
              protected: newchat.protected,
              maxUsers : newchat.maxUsers,
              owner_group_chat: newchat.owner_group_chat,
            },
        });
        if(new_chat)
        {
            console.log("CreateChat: ton chat est le suivant " + new_chat);
            await this.AddUserToChat(newchat.owner_group_chat, newchat.name_chat);
            return new_chat;
        }
    }

    async AddUserToChat(username: string, name_chat: string){

        console.log("AddUserToChat: begin")
        console.log(username);
        console.log(name_chat);
        // const adminSession = await this.prisma.chat.findUnique({
		    //   	where: {
		    //   		chat_name: name_chat,
		    //   	},
		    //   	select: {
		    //   		users: {
		    //   			where: {
		    //   				username: username,
		    //   			},
		    //   		},
		    //   	},
		    //   });
        // if(!adminSession)
        //     return console.log("Deja dans la liste");
        const Session = await this.AlreadyInTheCHat(username, name_chat);
        if(Session === null)
          return console.log("AddUserToChat: on sort ya pas de chat"), null;
        else if(Session)
          return console.log("AddUserToChat: already in chat");
        else
        {
          const users = await this.prisma.chat.update({
              where: { chat_name: name_chat},
              data: {
                users: {
                  connect: { username: username },
                },
              },
            });
          if(users)
          {
            console.log("AddUserToChat: ON a enregistrer l'user normalement");
            return users;
          }
        }

    }

    async AddMessageToChat(msg: MessageForm){

        console.log("New message to add here");
        const messages = await this.prisma.message.create({
            data: {
                name_chat: msg.name_chat,
                from: msg.from,
                from_id: msg.from_id,
                to: msg.to,
                to_id: msg.to_id,
                content: msg.content,
            },
            select: {
                my_chat: true,
            },
            
        })
        if(messages)
        {
            console.log("on a cree ton msg ");
            if(messages.my_chat.type === "dm")
            {
               await  this.AddUserToChat(msg.from, msg.name_chat);
               await  this.AddUserToChat(msg.to, msg.name_chat);
            }
            return messages;
        }
    }


    async AdminUsers(admin_name: string, name_chat: string){
      const check = await this.AlreadyInTheCHat(admin_name, name_chat);
      if(check)
      { 
        const admin = await this.prisma.chat.update({
          where: { chat_name: name_chat},
          data: {
            admins: {
              connect: { username: admin_name },
            },
          },
        });
        if(admin)
          return admin;
      }
      return check;

  }

    async BannedUsers(admin_name: string, name_chat: string){
      const check = await this.AlreadyInTheCHat(admin_name, name_chat);
      if(check)
      { 
        const admin = await this.prisma.chat.update({
            where: { chat_name: name_chat},
            data: {
              banned: {
                connect: { username: admin_name },
              },
            },
          });
        if(admin)
        {
          await this.DeleteUser(admin_name, name_chat);
          return admin;
        }
      }
      return check;
    }

    
    async MutedUsers(admin_name: string, name_chat: string){
      const check = await this.AlreadyInTheCHat(admin_name, name_chat);
      if(check)
      { 
        const admin = await this.prisma.chat.update({
            where: { chat_name: name_chat},
            data: {
              muted: {
                connect: { username: admin_name },
              },
            },
          });
        if(admin)
          return admin;
      }
      return check;
    }

    async DeleteUser(username: string, name_chat: string)
    {
      const Session = await this.AlreadyInTheCHat(username, name_chat);
      if(!Session)
        return null;
      const users = await this.prisma.chat.update({
          where: { chat_name: name_chat},
          data: {
            users: {
              disconnect: { username: username },
            },
            admins: {
              disconnect: { username: username },
            },
            muted: {
              disconnect: { username: username },
            },
          },
        });
      if(users)
      {
        if(username === users.owner_group_chat)
        {
          const channel = await this.prisma.chat.update({
            where: { chat_name : name_chat},
            data: {
              owner_group_chat: null,
            },
          });
          return channel;
        }  
        return users;
      }

    }

    async UnbannedUser(username: string, name_chat: string)
    {
      const users = await this.prisma.chat.update({
          where: { chat_name: name_chat},
          data: {
            banned: {
              disconnect: { username: username },
            },
          },
        });
      if(users)
        return users;
    }

    async UnMuteUser(username: string, name_chat: string)
    {
      const users = await this.prisma.chat.update({
          where: { chat_name: name_chat},
          data: {
            muted: {
              disconnect: { username: username },
            },
          },
        });
      if(users)
        return users;
    }

    async ChangePassword(pwd : any, name_chat: string)
    {
      console.log("ChangePassword: begin")

      const chani = await this.prisma.chat.findFirst({
        where: {
          chat_name: name_chat,
        },
        include: {
          users: true,
          admins: true,
          muted: true,
          banned: true,
        }
      });
      if(chani)
      {
        // const chan = await this.prisma.chat.create({
        //   data: {
        //     chat_name: chani.chat_name,
        //     owner_group_chat: chani.owner_group_chat,
        //     type: chani.type,
        //     maxUsers: chani.maxUsers,
        //     protected: pwd,

        //   }
        // })



        const chan = await this.prisma.chat.update({
          where: { 
            chat_name: chani.chat_name,
          },
        data:{
          protected: pwd,
        },
      });
      }
    }

    async DeletePassword(name_chat: string)
    {
      console.log("DeletePassword: begin")
      const chani = await this.prisma.chat.findFirst({
        where: {
          chat_name: name_chat,
        }
      });
      const chan = await this.prisma.chat.update({
        where:{ chat_name: chani.chat_name},
        data: {
          protected: null,
        },
      });
    }
}
