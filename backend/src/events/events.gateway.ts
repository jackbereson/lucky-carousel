import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  handleJoin(client: Socket, sessionId: string) {
    client.join(`session:${sessionId}`);
  }

  emitToSession(sessionId: string, event: string, data: any) {
    this.server.to(`session:${sessionId}`).emit(event, data);
  }
}
