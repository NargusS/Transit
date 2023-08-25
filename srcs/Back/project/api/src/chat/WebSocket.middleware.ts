import { Injectable, NestMiddleware } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SessionStore } from './storage.service';
import * as crypto from 'crypto';
import { randomBytes } from 'crypto';
import { CustomSocket } from 'src/interface/success-response.interface';


@Injectable()
export class WebSocketMiddleware implements NestMiddleware {
    constructor(private sessionStore: SessionStore){}
  async use(socket: CustomSocket, next: () => void) {
  //   // Perform any preprocessing logic here
  //   console.log("Welcome to the middleware");
    
    
  //   const sessionID = socket.handshake.auth.sessionID;
  //   if (sessionID) {
  //   console.log("Welcome to this socket = " + sessionID);
  //     const session = await this.sessionStore.findSession(sessionID);
  //     if (session) {
  //       socket.sessionId = sessionID;
  //       socket.userId = session.userId;
  //       socket.username = session.username;
  //       return next();
  //     }
  //   }
  //   const username = socket.handshake.auth.username;
  //   if (!username) {
  //       return console.log("No username")
  //   //   return next(new Error("invalid username"));
  //   }
  //   socket.sessionId = randomBytes(8).toString('hex'); //a session ID, private, which will be used to authenticate the user upon reconnection
  //   socket.userId = randomBytes(8).toString('hex');//a user ID, public, which will be used as an identifier to exchange messages
  //   socket.username = username;
    next();
  }
}