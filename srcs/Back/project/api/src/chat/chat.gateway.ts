import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
// import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthService } from "src/auth/auth.service";
import { GetUser } from "src/auth/decorator";
import * as jwt from 'jsonwebtoken';
import { WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, MessageBody } from '@nestjs/websockets';


@WebSocketGateway({cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private users = [];
  
    afterInit() {
      console.log('Server initialized');
    }
  
    handleConnection(socket: Socket) {
      console.log(`⚡: ${socket.id} user just connected!`);
  
      socket.on('message', (data) => {
        this.server.emit('messageResponse', data);
      });
  
      socket.on('typing', (data) => {
        socket.broadcast.emit('typingResponse', data);
      });
  
      socket.on('newUser', (data) => {
        this.users.push(data);
        this.server.emit('newUserResponse', this.users);
      });
    }
  
    handleDisconnect(socket: Socket) {
      console.log('🔥: A user disconnected');
      this.users = this.users.filter((user) => user.socketID !== socket.id);
      this.server.emit('newUserResponse', this.users);
      socket.disconnect();
    }
  }




// @Injectable()
// export class ChatGateway{
//     constructor( private config: ConfigService){}
//     @WebSocketServer() server: Server;
    // clients: Map<string, Socket> = new Map();
    // channel_rooms: Map<string, string> = new Map();


    // async handleConnection(client: Socket) {
    //     console.log('bonjour les mecs')
    //     const accessToken = client.handshake.query.accessToken as string;
    //     const secret = await this.config.get('JWT_SECRET');
    //     const final = jwt.verify(accessToken, secret) as { email: string; nickname: string };
    //     if(final)
    //         console.log(final.nickname + "is Connected to the chat server");
    //         this.clients.set(final.nickname, client);
    //         // this.server.emit('messageResponse', {
    //         //     nickname: final.nickname,
    //         //     avati: "https://picsum.photos/200/300",
    //         //   });
        
    // }


    // @SubscribeMessage('chat')
    // async handleMessage(@MessageBody()  message : any, @ConnectedSocket() client: Socket)  
    // {
    //     console.log("Welcome to message event")
    //     console.log("Nouveau mss = " + message);
    //     // console.log("Socket = " + accessToken)
        
    //     // const accessToken = client.handshake.query.accessToken as string;
    //     // const secret = await this.config.get('JWT_SECRET');
    //     // // try{
    //     //     const final = jwt.verify(accessToken, secret) as { email: string; nickname: string };
    //     //     if(final)
    //     //         console.log('finally =' + final.nickname);
    //     //        client.emit('chat', {
    //     //             message: message,
    //     //             nickname: final.nickname,
    //     //             avati: "https://picsum.photos/200/300",
    //     //           });
    //     // }catch(error)
    //     // {
    //     //     console.log(error);
    //     //     client.emit('exception', error.message);
    //     //     return
    //     // }
    //     // console.log('everything looks great')
    //     // const receiver = this.clients.get(client.id);
    //     // if (receiver) {
    //     //     client.socket.emit('message', message);

    //     this.server.emit('chat',  message) //on envoit a tout le monde 
    // }


    // // @SubscribeMessage('channel')
    // // async CreateChannel(@ConnectedSocket() client: Socket, @MessageBody() data:any)
    // // {
    // //     // verifie dans la database si il a pas deja ete creer
    // //     // data.channel_name;
    // //     client.join(data.channel_name);
    // //     const welcome_msg = "The room" + data.channel_name + "was created by " + client.
    // //     this.server.to(roomName).emit('roomMessage', );

    // // }


// }