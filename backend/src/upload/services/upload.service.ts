import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UploadDto } from '../upload-dto/upload-dto';
import { UploadEntity } from '../upload-entity/upload-entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UploadService {
  constructor(
    @InjectModel(UploadEntity.name)
    private readonly fileModel: Model<UploadEntity>,
    @Inject('MESSAGE_BROKER')
    private readonly messageBroker: ClientProxy,
  ) { }

  async uploadFiles(fileDtos: UploadDto[]): Promise<void> {
    for (const fileDto of fileDtos) {
      const newFile = new this.fileModel(fileDto);
      await newFile.save();

      for (let progress = 10; progress <= 100; progress += 10) {
        newFile.uploadProgress = progress;
        await newFile.save();

        // Enviar mensagem para o RabbitMQ
        this.messageBroker.emit('upload-progress', {
          fileId: newFile.id,
          progress,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  async getUploadProgress(fileId: string): Promise<number> {
    const file = await this.fileModel.findOne({ _id: fileId }).exec();

    return file.uploadProgress;
  }
}
