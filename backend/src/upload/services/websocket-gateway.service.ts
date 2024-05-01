import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
export class WebSocketGatewayService {
  @WebSocketServer()
  server: Server;

  async sendProgressToClient(fileId: string, progress: number): Promise<void> {
    this.server.emit('uploadProgress', { fileId, progress });
  }
}
