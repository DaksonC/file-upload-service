export class UploadDto {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: Date;
  uploadProgress: number;
}
