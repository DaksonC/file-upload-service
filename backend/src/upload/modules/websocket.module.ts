import { Module } from '@nestjs/common';
import { WebSocketGatewayService } from '../services/websocket-gateway.service';

@Module({
  providers: [WebSocketGatewayService],
  exports: [WebSocketGatewayService],
})
export class WebSocketModule {}
