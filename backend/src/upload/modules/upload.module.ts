import { Module } from '@nestjs/common';
import { UploadController } from '../controllers/upload.controller';
import { UploadService } from '../services/upload.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema, UploadEntity } from '../upload-entity/upload-entity';
import { MessageBrokerService } from '../services/message-broker.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EnvironmentModule } from './environment.module';
import * as dotenv from 'dotenv';
import { WebSocketModule } from './websocket.module';

dotenv.config();

@Module({
  imports: [
    WebSocketModule,
    EnvironmentModule.forRoot(),
    MongooseModule.forFeature([
      { name: UploadEntity.name, schema: FileSchema },
    ]),
    ClientsModule.register([
      {
        name: 'MESSAGE_BROKER',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'file-upload-progress',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [UploadController],
  providers: [UploadService, MessageBrokerService],
  exports: [UploadService],
})
export class UploadModule {}
