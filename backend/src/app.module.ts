import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/modules/upload.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    UploadModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
        autoCreate: true, // Cria automaticamente o banco de dados
        dbName: process.env.MONGODB_NAME,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
