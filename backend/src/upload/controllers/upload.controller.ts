import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadDto } from '../upload-dto/upload-dto';
import { UploadService } from '../services/upload.service';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from '@nestjs/websockets';
import { WebSocketGatewayService } from '../services/websocket-gateway.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly webSocketGatewayService: WebSocketGatewayService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const fileDtos: UploadDto[] = files.map((file) => ({
      _id: uuidv4(),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadDate: new Date(),
      uploadProgress: 0,
      path: file.path,
    }));

    await this.uploadService.uploadFiles(fileDtos);
    return { message: 'Files upload completed!' };
  }

  @Get(':fileId/progress')
  async getUploadProgress(@Param('fileId') fileId: string) {
    return this.uploadService.getUploadProgress(fileId);
  }

  @WebSocketServer()
  uploadProgress(client: any, data: any): void {
    client.emit('uploadProgress', data);
  }
}
