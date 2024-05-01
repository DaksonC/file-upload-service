import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UploadEntity extends Document {
  @Prop({ required: true, auto: true })
  _id: string;

  @Prop()
  originalName: string;

  @Prop()
  mimeType: string;

  @Prop()
  size: number;

  @Prop()
  uploadDate: Date;

  @Prop()
  uploadProgress: number;
}

export const FileSchema = SchemaFactory.createForClass(UploadEntity);
