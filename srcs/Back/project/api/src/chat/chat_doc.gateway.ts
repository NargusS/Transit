import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { randomBytes } from 'crypto';
import { MessageStore, SessionStore } from './storage.service';
import { Injectable, ParseUUIDPipe } from '@nestjs/common';
import { CustomSocket, GroupChat, MatchForm, MessageForm } from 'src/interface/success-response.interface';
import { SessionDto } from 'src/auth/dto';
import { PrismaManagerService } from 'src/prisma_manager/prisma_manager.service';
import { MyWebSocketMiddleware } from 'src/middleware/auth-ws.middleware';
import { error, group } from 'console';
import { ChatService } from './chat.service';
import { GameService } from './game.service';
import * as argon2 from 'argon2';
import { subscribe } from 'diagnostics_channel';

enum StatusConnection {
  USER_EXIST,
  ERROR,
  NEW_USER,
}
@Injectable()
@WebSocketGateway({cors: true })
export class FileGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private prisma: PrismaManagerService, private sessionStore: SessionStore, private messageStore: MessageStore,
    private service : ChatService, private instance : GameService){}
  @WebSocketServer() server: Server;
  
  // @WebSocketServer() game: Server;
  private custom_room = [];
  private list_room = [];


  // async use(socket: CustomSocket): Promise<StatusConnection> {
  //   // Perform any preprocessing logic here
  //   console.log("Welcome to the middleware");
    
  //   const username = socket.handshake.auth.username;
  //   if (!username) {
  //     console.log('Pas de username')
  //       return StatusConnection.ERROR;
  //   //   return next(new Error("invalid username"));
  //   }

  //   console.log("Before check");
  //   const session = await this.sessionStore.findNickname(username);
  //   if (session) {
  //     console.log("Session existe")
  //     socket.sessionId = session.sessionId;
  //     socket.userId = session.userId;
  //     socket.username = session.username;
  //     return StatusConnection.USER_EXIST;
  //   }
  //   socket.sessionId = randomBytes(8).toString('hex'); //a session ID, private, which will be used to authenticate the user upon reconnection
  //   socket.userId = randomBytes(8).toString('hex');//a user ID, public, which will be used as an identifier to exchange messages
  //   socket.username = username;
  //   console.log("IN USE USERID",socket.userId)
  //   console.log("username")
  //   console.log("IN USE USERNAME",username);
  //   // return this.handleConnection(socket);
  //   return StatusConnection.NEW_USER;
  // }

  // async handleConnection(socket: CustomSocket) {
  //   console.log("IN HANDLE CONNECTION")
  //   let test = await this.use(socket);
  //   if(test == StatusConnection.ERROR)
  //     return;
  //     const dto = new SessionDto; // a voir si le const derange pas
  //     dto.userId =socket.userId;
  //     dto.username = socket.username;
  //     dto.connected = true;
  //     dto.sessionId = socket.sessionId;
  //     console.log("handleConnection: ",socket.userId)
  //     console.log("handleConnection: ",dto);
  //     // Persist session
  //     const me = await this.sessionStore.saveSession(socket.username, dto);
  //   // }
  //   // console.log("bonjour + " + JSON.stringify(me.user.blacklist, null, 2));
  //   console.log(`Client connected: ${socket.sessionId} ✨`);
    
  //     // Emit session details
  //     socket.emit('session', {
  //       user_info: me,
  //     });
  //     // Join the "userId" room
  //     socket.join(socket.userId);
  //     console.log(`Client ${socket.sessionId} joined room ${socket.userId} 🚪`);

  //     // Fetch existing users
  //     const users = [];
  //     const messagesPerUser = new Map();

  //     const messages = await this.messageStore.findMessagesForUser(socket.userId);
  //     console.log(`Fetched messages for user ${socket.userId} 📩`);
  //     messages.forEach((message) => {
  //       const { from, to } = message;
  //       const otherUser = socket.userId === from ? to : from;
  //       if (messagesPerUser.has(otherUser)) {
  //         messagesPerUser.get(otherUser).push(message);
  //       } else {
  //         messagesPerUser.set(otherUser, [message]);
  //       }
  //     });

  //     const sessions = await this.sessionStore.findAllSessions();

  //     sessions.forEach((session) => {
  //       users.push({
  //         userId: session.userId,
  //         username: session.username,
  //         connected: session.connected,
  //         messages: messagesPerUser.get(session.userId) || [],
  //       });
  //     });

  //     socket.emit('users', users);
  //     // console.log("users = " + users);
  //     // console.log("rooms = " + this.list_room);
  //     // this.server.emit("rooms_list", this.list_room);

  //     console.log(`Users emitted to client ${socket.sessionId} 👥:`, users);
  //     // Notify existing users
  //     // socket.broadcast.emit('user_connected', {
  //     //   userId: socket.userId,
  //     //   username: socket.username,
  //     //   connected: true,
  //     //   messages: [],
  //     // });
  //     const channels_list = await this.service.FindAllChannel();
  //     if(channels_list)
  //       this.server.emit("rooms_list", channels_list);
  //     console.log(`User ${socket.userId} connected: 👤`);
  // }


  async use(socket: CustomSocket): Promise<StatusConnection> {
    // Perform any preprocessing logic here
    console.log("Middleware: begin");
    
    const username = socket.handshake.auth.username;
    if (!username) {
      console.log('Middleware: Pas de username')
        return StatusConnection.ERROR;
    //   return next(new Error("invalid username"));
    }
    // return StatusConnection.ERROR;
      const real_user = await this.prisma.user.findUnique({
        where: {
          nickname: username,
        }
      })
      if(!real_user)
      {
        console.log('Middleware: Pas de username 2')
        return StatusConnection.ERROR;
      }

    console.log("Middleware: Before check");
    const session = await this.sessionStore.findNickname(username);
    // const session = await this.sessionStore.findSession(socket.id);
    if (session) {
      console.log("Middleware: Session existe")
      socket.sessionId = session.sessionId;
      socket.userId = session.userId;
      socket.username = session.username;
      socket.status = session.connected;
      return StatusConnection.USER_EXIST;
    }
    socket.sessionId = randomBytes(8).toString('hex'); //a session ID, private, which will be used to authenticate the user upon reconnection
    socket.userId = randomBytes(8).toString('hex');//a user ID, public, which will be used as an identifier to exchange messages
    socket.username = username;
    console.log("Middleware: USERID",socket.userId)
    console.log("Middleware: USERNAME ",username);
    // return this.handleConnection(socket);
    return StatusConnection.NEW_USER;
  }

  async handleConnection(socket: CustomSocket) {
    console.log("Connect: begin")
    let test = await this.use(socket);
    if(test == StatusConnection.ERROR)
      return;
      const dto = new SessionDto; // a voir si le const derange pas
      dto.sessionId = socket.sessionId;
      dto.userId =socket.userId;
      dto.username = socket.username;
      if(socket.status === "ingame")
        dto.connected = "ingame";
      else
      {
        console.log("Connection : pas de status ingame")
        dto.connected = "online";
        socket.status = "online"; //ici je dois bloquer si c'est ingame ou pas 
      }
      console.log("Connect: ",socket.userId)
      console.log("Connect: ",dto);
      // Persist session
      const me = await this.sessionStore.saveSession(socket.username, dto);
      if(!me)
      {
        console.log("Connect: Cette username n'est pas presente dans notre db");
        return StatusConnection.ERROR;
      }
    // }
    // console.log("bonjour + " + JSON.stringify(me.user.blacklist, null, 2));
    console.log(`Connect: Client connected: ${socket.sessionId} ✨`);
    
      // Emit session details
      socket.emit('session', {
        user_info: me,
        block: me.user.blacklist,
        stalk: me.user.blocklist,
      });
      // Join the "userId" room
      socket.join(socket.userId);
      console.log(`Connect: Client ${socket.sessionId} joined room ${socket.userId} 🚪`);

      // Fetch existing users
      const users = [];


      const sessions = await this.sessionStore.findAllSessions();
      this.server.emit('users', sessions);

      
      // sessions.forEach((session) => {
      //   users.push({
      //     userId: session.userId,
      //     username: session.username,
      //     connected: session.connected,
      //     messages: messagesPerUser.get(session.userId) || [],
      //   });
      // });

      // socket.emit('users', users);
      // console.log("users = " + users);
      // console.log("rooms = " + this.list_room);
      // this.server.emit("rooms_list", this.list_room);

      console.log(`Connect:  Users emitted to client ${socket.sessionId} 👥:`, users);
      // Notify existing users
      // socket.broadcast.emit('user_connected', {
      //   userId: socket.userId,
      //   username: socket.username,
      //   connected: true,
      //   messages: [],
      // });
      const channels_list = await this.service.FindAllChannel();
      if(channels_list)
        this.server.emit("rooms_list", channels_list);
      console.log(`Connect: User ${socket.userId} connected: 👤`);
  }

  async handleDisconnect(socket: CustomSocket) {
    let test = await this.use(socket);
    if(test === StatusConnection.ERROR)
      return;

    // const matchingSockets = await this.server.in(socket.userId).allSockets();
    console.log("Disconnect: Your are gonna be disconnected " + socket.username);
    const matchingSockets = await this.server.in(socket.userId).fetchSockets();
    const isDisconnected = matchingSockets.length === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user disconnected", socket.userId);
      // update the connection status of the session
      const dto = new SessionDto;
      dto.userId =socket.userId;
      dto.username = socket.username;
      dto.connected = "offline";
      dto.sessionId = socket.sessionId;
      socket.status = "offline";
      await this.sessionStore.saveSession(socket.username, dto);
      await this.sessionStore.SessionStatus(socket.username, dto.connected);
      const sessions = await this.sessionStore.findAllSessions();
      if(sessions)
      {
        this.server.emit('users', sessions);
      }
      // await this.StopPlaying(socket);
      console.log(`Disconnect: User ${socket.userId} disconnected: ❌`);
    }
  }

  @SubscribeMessage("protected_channel")
  async handleProtectedChannel(socket: CustomSocket, payload: {mdp: string, channel: any})
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    console.log("ON protege son prochain " + payload.mdp);
    let test = await argon2.verify(payload.channel.protected, payload.mdp);
    if(test)
      console.log('Ce sont les memes password');
    socket.emit("IsProtected", test);
  }

  @SubscribeMessage("findDm")
  async retrieveDm(socket: CustomSocket, friend: string)
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    const chat = await this.service.FindDm(friend, socket.username);
    socket.emit("ActualDm", chat);
  }

  @SubscribeMessage('private message')
  async handlePrivateMessage(socket: CustomSocket, payload: { content: string; to: string, to_username: string }) {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    console.log("On est dans private msg la")
    const message: MessageForm = {
      name_chat: "",
      from     : socket.username,
      from_id  : socket.userId,
      to_id    : payload.to,
      to       : payload.to_username,
      content  : payload.content,
    };
    socket.to(payload.to).emit('private message', message);

    const chat_name = message.from + '_dm_' + message.to;
    const chat_name2 =  message.to + '_dm_' + message.from;
    let test1 = await this.service.FindChat(chat_name);
    let test2 = await this.service.FindChat(chat_name2);
    if(!test1 && !test2)
    {
      console.log("Pas de chat crée");
      let groupChat: GroupChat = {
        name_chat: chat_name,
        type: "dm",
        protected: "",
        maxUsers: 2,
        owner_group_chat: socket.username,
      };
      await this.service.CreateChat(groupChat);
      message.name_chat = chat_name;
    }
    else if(test1)
    {
      console.log("Test1 = " + test1)
      message.name_chat = chat_name;
    }
    else
    {
      console.log("Test2 = " + test2);
      message.name_chat = chat_name2;
    }
    console.log("Ton name chat c'est " + message.name_chat);
    console.log(message);
    await this.service.AddMessageToChat(message);
    // this.retrieveDm(socket, message.)
    // socket.to(payload.to).to(socket.userId).emit('private message', message);
    // this.messageStore.saveMessage(message);
  }

  @SubscribeMessage('create_channel')
  async createGroupChat(socket: CustomSocket, payload: {chat_name: string, password: string, type: string})
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    let password = "";
    if(payload.password)
    {
      console.log("create chan " + payload.password);
      password = await argon2.hash(payload.password);
    }
    let groupChat: GroupChat = {
      name_chat: payload.chat_name,
      type: "channel_" + payload.type,
      protected: password,
      maxUsers: 0,
      owner_group_chat: socket.username,
    };
    const channel = await this.service.CreateChat(groupChat);
    const message: MessageForm = {
      name_chat: payload.chat_name,
      from     : socket.username,
      from_id  : socket.userId,
      to_id    : payload.chat_name,
      to       : payload.chat_name,
      content  : "Welcome to " + payload.chat_name,
    };
    if(!channel)
      await this.handleGroupChat(socket, {rooms_name: message.name_chat, content: message.content});
    else{
      socket.join(payload.chat_name);
      this.server.to(payload.chat_name).emit("NewChatCreated", message);
      // await this.service.AdminUsers(socket.username, payload.chat_name);
    }
    const channels_list = await this.service.FindAllChannel();
    if(channels_list)
    {
      // console.log("list = " + JSON.stringify(channels_list, null, 2));
      this.server.emit("rooms_list", channels_list);
    }

  }

  @SubscribeMessage('group_chat')
  async handleGroupChat(socket: CustomSocket, payload: { rooms_name: string, content: string})
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    // if(!(this.list_room.find(item => item === payload.rooms_name)))
    // {
    //   console.log("Ta room existe pas encore , " + payload.rooms_name);
    //   this.list_room.push(payload.rooms_name);
    // }
    socket.join(payload.rooms_name);
    console.log(payload.rooms_name);
    const users = await this.service.AddUserToChat(socket.username, payload.rooms_name);
    console.log(`${socket.username} has join the room ${payload.rooms_name}`);
    console.log("msg du group" + payload.content)
    // const message = {
    //   content: payload.content,
    //   from: socket.username,
      // to: payload.rooms_name,
    // };
    const message: MessageForm = {
      name_chat: payload.rooms_name,
      from     : socket.username,
      from_id  : socket.userId,
      to_id    : payload.rooms_name,
      to       : payload.rooms_name,
      content  : payload.content,
    };
    this.server.to(payload.rooms_name).emit("messageFromRoom", message);
    await this.service.AddMessageToChat(message);
    const channels_list = await this.service.FindAllChannel();
      if(channels_list)
        this.server.emit("rooms_list", channels_list);
    // this.server.emit("collaborators", users);
    // this.handlePrivateMessage(socket, {content: payload.content, to: payload.rooms_name});
    // socket.emit("group_chat_rep", `You are in the group ${payload.rooms_name}`);
  }
  

  @SubscribeMessage("Admin")
  async BecomeAdmin(socket: CustomSocket, payload: {new_admin: string, chat: any})
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    // console.log("yi");

    await this.service.AdminUsers(payload.new_admin, payload.chat.chat_name);
    const channels_list = await this.service.FindAllChannel();
    if(channels_list)
    {
      // console.log("list = " + JSON.stringify(channels_list, null, 2));
      this.server.emit("rooms_list", channels_list);
    }
  }
  
  @SubscribeMessage("Mute")
  async MuteSomeone(socket: CustomSocket, payload: {user_muted: string, chat: any})
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    console.log("yo");
    await this.service.MutedUsers(payload.user_muted, payload.chat.chat_name);
    const channels_list = await this.service.FindAllChannel();
    if(channels_list)
    {
      // console.log("list = " + JSON.stringify(channels_list, null, 2));
      this.server.emit("rooms_list", channels_list);
    }
  }

  @SubscribeMessage("UnMute")
  async UnMuteSomeone(socket: CustomSocket, payload: {user_muted: string, chat: any})
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    console.log("yo");
    await this.service.UnMuteUser(payload.user_muted, payload.chat.chat_name);
    const channels_list = await this.service.FindAllChannel();
    if(channels_list)
    {
      // console.log("list = " + JSON.stringify(channels_list, null, 2));
      this.server.emit("rooms_list", channels_list);
    }
  }



  @SubscribeMessage("Ban")
  async BanUser(socket: CustomSocket, payload: {user_banned: string, chat: any})
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    console.log("Ban: Yo");
    await this.service.BannedUsers(payload.user_banned, payload.chat.chat_name);
    const channels_list = await this.service.FindAllChannel();
    if(channels_list)
    {
      // console.log("list = " + JSON.stringify(channels_list, null, 2));
      this.server.emit("rooms_list", channels_list);
    }
  }

  @SubscribeMessage("Unban")
  async UnBanUser(socket: CustomSocket, payload: {user_banned: string, chat: any})
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    await this.service.UnbannedUser(payload.user_banned, payload.chat.chat_name);
    const channels_list = await this.service.FindAllChannel();
    if(channels_list)
    {
      // console.log("list = " + JSON.stringify(channels_list, null, 2));
      this.server.emit("rooms_list", channels_list);
    }
  }

  @SubscribeMessage("Kick")
  async KickFromChat(socket: CustomSocket, payload: {user_kicked: string, chat: any})
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    await this.service.DeleteUser(payload.user_kicked, payload.chat.chat_name);
    const channels_list = await this.service.FindAllChannel();
    if(channels_list)
    {
      // console.log("list = " + JSON.stringify(channels_list, null, 2));
      this.server.emit("rooms_list", channels_list);
    }
  }

  @SubscribeMessage("change-password") //tester avec l'ancien docker 
  async modifyPwd(socket: CustomSocket, payload: {room_name: string, pwd: string, action: string})
  {
    console.log(payload);
    if(payload.action === "modify")
    {
      if(payload.pwd)
      {
        const password = await argon2.hash(payload.pwd);
        await this.service.ChangePassword(password, payload.room_name);
      }
    }
    else
    {
      await this.service.DeletePassword(payload.room_name);
    }
    const channels_list = await this.service.FindAllChannel();
    if(channels_list)
    {
      // console.log("list = " + JSON.stringify(channels_list, null, 2));
      this.server.emit("rooms_list", channels_list);
    }
    
  }


  @SubscribeMessage("LeaveChat")
  async LeaveChat(socket: CustomSocket, channel: any)
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    await this.service.DeleteUser(socket.username, channel.chat_name);
    const channels_list = await this.service.FindAllChannel();
    if(channels_list)
    {
      console.log("list = " + JSON.stringify(channels_list, null, 2));
      this.server.emit("rooms_list", channels_list);
    }
  }

  @SubscribeMessage('stop_waiting')
  async StopPlaying(socket: CustomSocket)
  {
    // let check = await this.use(socket);
    // if(check === StatusConnection.ERROR)
    //   return;

    // Assuming this is inside an asynchronous function
    console.log("Stop Playing: begin " + socket.username)
  const updatedCustomRoom = this.custom_room.filter(item => item !== socket);
  const updatedListRoom = [];

  for (const item of this.list_room) {
    const splitted = item.split("_");
    if (splitted && (splitted[0] === socket.username || splitted[1] === socket.username)) {
      socket.leave(item);
      console.log(`Stop Playing: ${socket.username} has left the room ${item}`);
      await this.sessionStore.SessionStatus(socket.username, "online");
      const room = this.server.sockets.adapter.rooms.get(item);
      
      if (!room) {
        console.log(`Stop Playing: Room ${item} will be deleted`);
      } else {
        const roomSocketIds = Array.from(room.keys());
        console.log(`Stop PLaying: Room '${item}' has sockets: ${roomSocketIds.join(', ')}`);
        updatedListRoom.push(item);
      }
    } else {
      updatedListRoom.push(item);
    }
  }

  this.custom_room = updatedCustomRoom;
  this.list_room = updatedListRoom;

  if (this.list_room.length > 0) {
    console.log(`Stop Playing: In the list room, there are ${this.list_room.length} items.`);
  } else {
    console.log("Stop Playing: list_room is now empty.");
  }



    // this.custom_room = this.custom_room.filter(item => item !== socket);
    // this.list_room = this.list_room.filter(async (item) => {
    //   const splitted = item.split("_");
    //   if(splitted && (splitted[0] === socket.username || splitted[1] === socket.username))
    //   {
    //     socket.leave(item);
    //     console.log(`${socket.username} a quitté la room ${item}`)
    //     await this.sessionStore.SessionStatus(socket.username, "online");
    //     const room = this.server.sockets.adapter.rooms.get(item);
    //     if(!room)
    //     {
    //       console.log(`La room ${item} va etre supprimée`)
    //       return false;
    //     }
    //     // if (room) {
    //     //   // room.forEach((user_socket) => {
    //     //   //   const socketInRoom: CustomSocket = this.server.sockets.sockets.get(user_socket);
        
    //     //   //   if (socketInRoom) {
    //     //   //     // Now you have access to socketInRoom and its properties
    //     //   //     // console.log('Socket ID:', socket.id);
    //     //   //     console.log('Username:', socketInRoom.username);
    //     //   //     // ...
    //     //   //   }
    //     //   //   else
    //     //   //   {
    //     //   //     console.log("PLus personne dans la room");
    //     //   //   }
    //     //   // });
    //     // }
    //     // else
    //   }
    //   else
    //       return true;
    // });
    // if(this.list_room)
    //     console.log("Dans la list room, il y a = " + this.list_room);
    // else
    //   console.log("List_room n'existe plus askip");
  }

  @SubscribeMessage('CheckInvite')
  async handleInviteAccepted(socket: CustomSocket)
  {
    // let check = await this.use(socket);
    // if(check === StatusConnection.ERROR)
    //   return;
  
    console.log("CheckInvite: begin");
    const game  = this.list_room.some(async (item) => {
      const splitted = item.split("_");
      if(splitted && (splitted[0] === socket.username || splitted[1] === socket.username))
      {
        await this.sessionStore.SessionStatus(splitted[0], "ingame");
        await this.sessionStore.SessionStatus(splitted[1], "ingame");
        const message = {
          player1: splitted[0],
          player2: splitted[1],
          room_name: item,
        }
        console.log("CHeckInvite : room = " + item);
        const sessions = await this.sessionStore.findAllSessions();
        this.server.emit('users', sessions);
        this.server.to(item).emit("Opponent_found", message);
        return true;
      }
      return false;
    })
    if(game)
    {
      console.log("CheckInvite : go jouer frrr");
      return true;
    }
    console.log("CHecKInvite :  false")
    return false;


  }

  @SubscribeMessage('status')
  async sendStatus(socket: CustomSocket)
  {
    const user = await this.sessionStore.findNickname(socket.username);
    if(user)
    {
      socket.emit("status_user", user.connected);
    }
  }

  @SubscribeMessage('waiting_player')
  async handlePlayers(socket: CustomSocket)
  {
    // let check = await this.use(socket);
    // if(check === StatusConnection.ERROR)
    //   return;
    console.log("Waiting PLayer: id =" + socket.id)
    console.log("Waiting PLayer: userId =" + socket.userId);
    let invite = await this.handleInviteAccepted(socket);
    if(invite)
       return;
    console.log("Waiting Player: begin")
    let player1;
    let player2;
    let custom_room_name = "";
    if(this.custom_room.length < 2)
    {
      console.log("Waiting Player: " + this.custom_room.length);
      const check = this.custom_room.find((element) => element.username === socket.username);
      if(check)
      {
        console.log("Waiting Player: tu attends deja le sang");
        return;
      }
      this.custom_room.push(socket);
      if(this.custom_room.length === 2)
      {
        player1 = this.custom_room[0];
        player2 = this.custom_room[1];
        custom_room_name = player1.username + '_' + player2.username;
        console.log("Waiting Player: room_name = " + custom_room_name);
        this.custom_room.splice(0, this.custom_room.length);
        console.log("Waiting Player: size = " +this.custom_room.length);
      }
    }
    if(custom_room_name)
    {
      player1.join(custom_room_name);
      player1 = '';
      player2.join(custom_room_name);
      player2 = '';
      const check = this.server.sockets.adapter.rooms.has(custom_room_name)
      if(check)
      {
        console.log("Waiting Player: La room existe le sang");
        const room = this.server.sockets.adapter.rooms.get(custom_room_name);
        console.log(`Waiting Player: Il y a ${room.size} socket dans ${custom_room_name}`);
        if(room.size === 2)
        {
          // socket.join(custom_room_name);
          const splitArray = custom_room_name.split("_");
          await this.sessionStore.SessionStatus(splitArray[0], "ingame");
          await this.sessionStore.SessionStatus(splitArray[1], "ingame");
          const message = {
            player1: splitArray[0],
            player2: splitArray[1],
            room_name: custom_room_name,
          }
          this.list_room.push(custom_room_name);
          const sessions = await this.sessionStore.findAllSessions();
          this.server.emit('users', sessions);
          this.server.to(custom_room_name).emit("Opponent_found", message);
        }
        else
          console.log("Waiting Player: Trop de monde ici");
      }
    }
  }

  @SubscribeMessage("InviteToGame")
  async handleInvite(socket: CustomSocket, payload:{opponent: string})
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    console.log("InviteGame : begin");
    console.log("J'invite :" + payload.opponent)
    const player2 = await this.sessionStore.findNickname(payload.opponent)
    if(player2 && player2.connected === "online" && socket.status === "online") //je check aussi le status in game ou pas
    {
      await this.StopPlaying(socket);
      console.log("InviteGame : conditions bonnes");
      const custom_room_name = socket.username + "_" + player2.username;
      console.log("InviteGame: room = " + custom_room_name);
      socket.join(custom_room_name);
      this.server.to(player2.userId).emit("InviteGame", socket.username); //chrono a lancer pour rep
      // socket.emit("TimeResponseInvite", {opponent: player2}); // lance le chrono en attente de rep pour celui qui envoie et afffiche modal
    }
    else
      socket.emit("NoGame"); //Donc on lance pas le modal
    // socket.emit("invitor", socket);
  }

  @SubscribeMessage("NoGameAnymore")
  async DontInvite(socket: CustomSocket, opponent: string)
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    if(opponent)
    {
      let player1 = await this.sessionStore.findNickname(opponent); 
      this.server.to(player1.userId).emit("NoGame");
    }
    await this.StopPlaying(socket);

  }


  @SubscribeMessage("GoGame")
  async handleGame(socket: CustomSocket, opponent: string)
  {
    let check = await this.use(socket);
    if(check === StatusConnection.ERROR)
      return;
    await this.StopPlaying(socket);
    console.log('GoGame: opponent =' + opponent);
    console.log("GOGame: me = " + socket.username);
    let player1 = await this.sessionStore.findNickname(opponent);
    // let player2 = await this.sessionStore.findNickname(socket.username);
    const custom_room_name = player1.username + "_" + socket.username;
    socket.join(custom_room_name);
    await this.sessionStore.SessionStatus(player1.username, "ingame");
    await this.sessionStore.SessionStatus(socket.username, "ingame");
    const message = {
      player1: player1.username,
      player2: socket.username,
      room_name: custom_room_name,
    }
    this.list_room.push(custom_room_name);
    console.log("list_room = " + this.list_room);
    console.log("GoGame: custom_room_name = " + custom_room_name);
    this.server.to(player1.userId).emit("GameAccepted");
    // this.server.to(custom_room_name).emit("Opponent_found", message);
  }

  @SubscribeMessage('Score')
  handleScore(socket: CustomSocket, payload: { rooms_name: string, content: any})
  {
    const message = {
      player1Score : payload.content.player1Score,
      player2Score : payload.content.player2Score,
    }
    const spectatorRoomName = `spectator_${payload.rooms_name}`;
    this.server.to(spectatorRoomName).emit("gameStateScore", message);
    this.server.to(payload.rooms_name).emit("ScoreResponse", message);

  }

  @SubscribeMessage('ballMovement')
  handleLive(socket: CustomSocket, payload: { rooms_name: string, content: any})
  {
    console.log("ballMovement: Path = " + payload.content.path);
    const message = {
      ballY : payload.content.ballY,
      ballX : payload.content.ballX,
      ballSpeedY : payload.content.ballSpeedY,
      ballSpeedX : payload.content.ballSpeedX,
      // player1Score : payload.content.player1Score,
      // player2Score : payload.content.player2Score,
    }
    this.server.to(payload.rooms_name).emit("messageBall", message);
    const spectatorRoomName = `spectator_${payload.rooms_name}`;
    this.server.to(spectatorRoomName).emit("gameStateBall", message);
    this.handleKill(socket, payload.rooms_name, payload.content.path);
  }

  @SubscribeMessage('paddleMovement')
  handlePlayer(socket: CustomSocket, payload: { rooms_name: string, content: any})
  {
    const message = {
      paddle1Y : payload.content.paddle1Y,
      paddle2Y : payload.content.paddle2Y,
      
    };
    // this.server.to(payload.rooms_name).emit("messagePaddle", message);
    socket.to(payload.rooms_name).emit("messagePaddle", message);
    
    const spectatorRoomName = `spectator_${payload.rooms_name}`;
    this.server.to(spectatorRoomName).emit("gameStatePaddle", message);
  }

  @SubscribeMessage("room_list")
  SendRoomsList(socket: CustomSocket)
  {
    console.log("List Room a send " + this.list_room);
    socket.emit("List_room", this.list_room);
  }


  @SubscribeMessage("spectatorJoin")
  handleSpectatorJoin(socket: CustomSocket,  matchId: string ) {
    socket.join(matchId);
  }

  @SubscribeMessage('spectatorLeave')
  handleSpectatorLeave(socket: CustomSocket, payload: { matchId: string }) {
    const spectatorRoomName = `spectator_${payload.matchId}`;
    socket.leave(spectatorRoomName);
  }


  @SubscribeMessage('game_over') //enregister dans la base de donnée pour match history
  async finishgame(socket: CustomSocket, payload:{rooms_name: string, content : any})
  {
    console.log("Game Over: begin");
  
    console.log("GAmeOver: " + socket.username);
    
    const message = {
        winner : payload.content.winner,
        player1Score : payload.content.player1Score,
      player2Score : payload.content.player2Score,
      from : socket.userId,
      to: payload.rooms_name,
    };
    const splitArray = payload.rooms_name.split("_");
    const winner = message.player1Score > message.player2Score ? message.player1Score : message.player2Score;
    const myscore = splitArray[0] === socket.username ? message.player1Score : message.player2Score;
    const game_stat : MatchForm = {
       my_nickname: socket.username,
       op_nickname: splitArray[0] === socket.username ? splitArray[1] : splitArray[0],
       my_score : splitArray[0] === socket.username ? message.player1Score : message.player2Score,
       op_score : message.player1Score === myscore ? message.player2Score : message.player1Score,
       win: winner === myscore ? true : false, 
      }

      const roomInfo = this.server.sockets.adapter.rooms.get(payload.rooms_name);
      if(roomInfo)
      {
        const roomSocketIds = Array.from(roomInfo.keys());
        const targetSocketId = socket.id;
        const isSocketInRoom = roomSocketIds.find(socketId => socketId === targetSocketId);
        if(isSocketInRoom)
        {
          if(game_stat.my_score === 11 || game_stat.op_score === 11)
          {
            console.log("GameOver: " + game_stat.my_score);
            console.log("GameOver: " + game_stat.op_score);
            await this.instance.AddMatch(game_stat);
          }
        }
        socket.leave(payload.rooms_name);
        await this.sessionStore.SessionStatus(socket.username, "online");
        console.log("GameOver: roominfo" +JSON.stringify(roomInfo, null, 2));
        console.log("GAmeOver: length room = " + roomSocketIds.length);
        console.log(`GameOver: Room '${payload.rooms_name}' has sockets: ${roomSocketIds.join(', ')}`);
        console.log("GameOver: plus personne dans cette room");
        this.list_room = this.list_room.filter(item => item !== payload.rooms_name);
        const check = this.list_room.find((item) => item === payload.rooms_name);
        const splitArray = payload.rooms_name.split("_");
        const player1 = await this.sessionStore.findNickname(splitArray[0]);
        const player2 = await this.sessionStore.findNickname(splitArray[1]);
        console.log("Kill: Player1 = " + player1.connected);
        console.log("Kill: Player2 = " + player2.connected);
        const CrashPlayer = player1.connected === "ingame" ? player1 : player2;
        console.log("KILL: CrashPLayer = " + CrashPlayer.username + " , RoomName = " + payload.rooms_name);
        const matchingSockets = await this.server.in(CrashPlayer.userId).fetchSockets();
        const isDisconnected = matchingSockets.length === 0;
        if (!isDisconnected) {
          this.sessionStore.SessionStatus(CrashPlayer.username, "online");
        }
        await this.handleConnection(socket);
      }
      
      
      
      // await this.StopPlaying(socket);
      
      // socket.leave(payload.rooms_name);
    }
    
    
    @SubscribeMessage("kill")
    async handleKill(socket: CustomSocket, room_name: string, path: string)
    {
      const room = this.server.sockets.adapter.rooms.get(room_name);
      if(room)
      {
        const roomSocketIds = Array.from(room.keys());
        if(roomSocketIds && roomSocketIds.length === 2)
        {
          console.log('KILL: tout est bon');
          return true;
        }
        else
        {
          if(roomSocketIds)
              console.log("Il manque quelqu'un, size = " + roomSocketIds.length);
          this.server.to(room_name).emit("KILL");
          // const splitArray = room_name.split("_");
          // const player1 = await this.sessionStore.findNickname(splitArray[0]);
          // const player2 = await this.sessionStore.findNickname(splitArray[1]);
          // console.log("Kill: Player1 = " + player1.connected);
          // console.log("Kill: Player2 = " + player2.connected);
          // const CrashPlayer = player1.connected === "ingame" ? player1 : player2;
          // console.log("KILL: CrashPLayer = " + CrashPlayer.username + " , RoomName = " + room_name);
          // const matchingSockets = await this.server.in(CrashPlayer.userId).fetchSockets();
          // const isDisconnected = matchingSockets.length === 0;
          // if (!isDisconnected) {
          //   this.sessionStore.SessionStatus(CrashPlayer.username, "online");
          // }
          return false;
        }
      }
      else
        console.log('ROom existe pas');
    }

    @SubscribeMessage('update-sessions')
    async UpdateSession(socket: CustomSocket)
    {
      console.log("sessions");
      const sessions = await this.sessionStore.findAllSessions();
      if(sessions)
      {
        this.server.emit('users', sessions);
      }
    }
  
    @SubscribeMessage('my-info')
    async UpdateMyInfo(socket: CustomSocket)
    {
      console.log("my-info");
      const me = await this.sessionStore.findNickname(socket.username);
      if(me)
      {
        // me.map((user) => user)
        console.log("me = " + me);
        socket.emit('session', {
          user_info: me,
          block: me.user.blacklist,
          stalk: me.user.blocklist, 
        });
        // socket.emit("Bloqued", me.user.blacklist);
        // socket.emit("Stalk", me.user.blocklist);

      }
    }

    @SubscribeMessage('channels')
    async sendListChan(socket: CustomSocket)
    {
      console.log("channels");
      const channels_list = await this.service.FindAllChannel();
      if(channels_list)
        this.server.emit("rooms_list", channels_list);
    }

    @SubscribeMessage('block')
    async areyoubloqued(socket: CustomSocket, user: string)
    {
      const blocked = await this.sessionStore.findNickname(user);
      if(blocked)
      {
        this.server.to(blocked.userId).emit("blocklist", {
          block: blocked.user.blacklist,
          stalk: blocked.user.blocklist,
        });
      }
      
    }

    @SubscribeMessage('stalk')
    async areyoustalker(socket: CustomSocket, user: string)
    {
      const me = await this.sessionStore.findNickname(socket.username);
      const rep = me.user.blocklist.some((admin) => admin.userId === user)  ? true : false;
      console.log(user + "m'a bloquer = " + rep);
      // socket.emit("Stalk", rep);
    }
}


