import { PrismaManagerService } from "src/prisma_manager/prisma_manager.service";
import { Injectable } from "@nestjs/common";
import { AuthDto, SessionDto } from "src/auth/dto";
import { DataService } from "src/database/database.service";

@Injectable()
export class SessionStore {
  constructor(private prisma: PrismaManagerService, private db : DataService) {

  }
  // sess =  new Map();


  async findNickname(name: string)
  { 
    const user = await this.prisma.session.findFirst({
      where: {
        username: name,
      },
      include: 
      {
        user: {
          select: {
            blacklist: true,
            blocklist: true,
          },
        },
      },
    });
    if(user)
    {
      // console.log("FindNickname: " + user);
      // console.log("j'existe bien Mariah = " + JSON.stringify(user, null, 2));
      console.log(`FindNickname: User ${name} exist in db `);

    }
    else
      console.log(`FindNickname: User  ${name} doesn't exist in db`);
    return user;
  }
  
  async findSession(id: string){
    console.log('on test le findSession')

    const user = await this.prisma.session.findUnique({
        where: { 
            sessionId: id,
           },
        });
    if(user)
        console.log('User existe dans la db')
    else
        console.log('Existe pas dans la db')
    return user;
        // const value = this.sess.get(id);
        // return value;
  }

  async SessionStatus(id: string, newstatus: string)
  {
    const user = await this.findNickname(id);
    if(!user)
      return;
    const session = await this.prisma.session.update({
      where: {
        sessionId: user.sessionId,
      },
      data:
      {
        connected: newstatus,
      } 
    })
    if(session)
    {
      await this.db.UpdateStatus(newstatus, id);
      return session;
    }
  }

  async ReelUser(id: string)
  {
    const user = await this.prisma.user.findUnique({
      where: {
        nickname: id,
      }
    });
    if(!user)
    {
      // const session = await this.findNickname(id);
      // if(session)
      // {
      //   await this.prisma.session.delete({
      //     where: {
      //       username: id,
      //     }
      //   });
      // }
      return false;
    }
    return true;
  }


  async saveSession(id: string, newSession: SessionDto){
     console.log("SaveSession: bonjour");
      if(!(await this.ReelUser(id)))
           return false;
       const session = await this.findNickname(id);
       if(session)
       {
          console.log("SaveSession: session existe = " + session)
          // if(session.connected === "ingame" && newSession.connected === "online")
          // {
          //   console.log("SaveSession: On garde ingame")
          //   newSession.connected = "ingame";
          // }
          // if(newSession.connected === "offline")
          //   console.log("SaveSession: offline")
         const status = await this.prisma.session.update({
           where:{
               sessionId: session.sessionId,
           },
           data: {
             userId: newSession.userId,
             sessionId: session.sessionId,
             username: newSession.username,
             connected: newSession.connected,
           },
           include: 
           {
             user: {
               select: {
                 blacklist: true,
                 blocklist: true,
               }
             }
           }
   
         })
        //  console.log("j'existe bien Mariah = " + JSON.stringify(status, null, 2));
         await this.db.UpdateStatus(newSession.connected, newSession.username);
         return status;
       }
       else
       {
         const user = await this.prisma.session.create({
         data: {
           userId: newSession.userId,
           sessionId: newSession.sessionId,
           username: newSession.username,
           connected: newSession.connected,
           for: "chat",
          },
          include: 
          {
            user: {
              select: {
                blacklist: true,
                blocklist: true,
              }
            }
          }
        })
        if(user)
        {
          // this.sess.set(id, user);
          // console.log("j'existe bien Mariah = " + user);
          await this.db.UpdateStatus(newSession.connected, newSession.username);
          return user;
        }
        }    
  }

  async findAllSessions() {
    const sessions = await this.prisma.session.findMany({
      include: {
        user:{
          select: {
            avatar: true,
          }
        }
      }
    });
    if(!sessions)
    {
      console.log("FindALLSessions: Y a pas de session le sang");
      return false; 
    }
    // console.log(JSON.stringify(sessions, null, 2));
    return sessions.map((user) => user);
  }
}

@Injectable()
export class MessageStore {
  constructor(private prisma: PrismaManagerService) {
    
  }

  async saveMessage(msg: any) {
    // return await this.prisma.message.create({
    //   data: {
    //     from: msg.from,
    //     to: msg.to,
    //     content: msg.content,
    //   },
    // });
  }

  async findMessagesForUser(userID: string) {
    console.log("Ton user c'est " + userID)
    const msg =  await this.prisma.message.findMany({
      where: {
        OR: [
          { from: userID },
          { to: userID },
        ],
      },
    });
    if(msg)
      console.log("Tu as des messages");
    else
      console.log("aucun msg");
    return msg;
  }
}
