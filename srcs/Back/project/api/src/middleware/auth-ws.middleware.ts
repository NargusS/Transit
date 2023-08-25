import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { MessageStore, SessionStore } from 'src/chat/storage.service';
import { CustomSocket } from 'src/interface/success-response.interface';
import { PrismaManagerService } from 'src/prisma_manager/prisma_manager.service';

@Injectable()
export class MyWebSocketMiddleware{

  constructor(private prisma: PrismaManagerService, private sessionStore: SessionStore, private messageStore: MessageStore){}

  async resolve(socket: CustomSocket, next: (err?: any) => void) {
      console.log("Welcome to the middleware");
      
      const sessionIDnotString = socket.handshake.auth.sessionID;
      const sessionID = JSON.stringify(sessionIDnotString);
      console.log(sessionIDnotString);
      console.log(sessionID);
      
      if (sessionID) {
        console.log("Welcome to this socket = " + sessionID);
        const session = await this.sessionStore.findSession(sessionID);
        console.log("Apres findSession");
        if (session) {
          console.log("Session existe");
          socket.sessionId = sessionID;
          socket.userId = session.userId;
          socket.username = session.username;
          return next(); // Continue to the next middleware or route handler
        }
      }
      
      const username = socket.handshake.auth.username;
      if (!username) {
        console.log('Pas de username');
        return next(new Error('Invalid username'));
      }
      
      socket.sessionId = randomBytes(8).toString('hex');
      socket.userId = randomBytes(8).toString('hex');
      socket.username = username;
      console.log(socket.userId);
      console.log("username");
      console.log(username);
      
      return next(); // Continue to the next middleware or route handler
  }
}