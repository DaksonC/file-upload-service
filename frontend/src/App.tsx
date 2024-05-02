import io, {Socket} from 'socket.io-client';
import React, { useState } from 'react';
import axios, { AxiosError, AxiosProgressEvent } from 'axios';

interface FileUploadStatus {
  id: string;
  file: File;
  bytesProcessed: number;
  fileSize: number;
  success?: boolean;
  error?: string;
  progress?: number;
}

const App: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [fileUploads, setFileUploads] = useState<FileUploadStatus[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const connectWebSocket = () => {
    const socketIo = io('http://localhost:3000');
    setSocket(socketIo);

    socketIo.on('uploadProgress', (data: { fileId: string; progress: number }) => {
      setFileUploads((prevFileUploads) =>
        prevFileUploads.map((item) =>
          item.id === data.fileId ? { ...item, progress: data.progress } : item
        )
      );
    });
    return socketIo;      
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
      setFileUploads(
        Array.from(e.target.files).map((file, index) => ({
          id: `${file.name}-${index}`,
          file,
          bytesProcessed: 0,
          fileSize: file.size,
        }))
      );
    }
  };

  const handleUploadProgress = (progressEvent: AxiosProgressEvent, file: File) => {
    setFileUploads((prevFileUploads) =>
      prevFileUploads.map((item) =>
        item.file === file ? { ...item, bytesProcessed: progressEvent.loaded } : item
      )
    );
    if (progressEvent.total !== null && progressEvent.total !== undefined) {
    const newTotalProgress = (progressEvent.loaded / progressEvent.total) * 100;
    setTotalProgress((prevTotalProgress) => prevTotalProgress + newTotalProgress);
  }
  };

  const handleUploadSuccess = (file: File) => {
    setFileUploads((prevFileUploads) =>
      prevFileUploads.map((item) =>
        item.file === file ? { ...item, success: true } : item
      )
    );
  };

  const handleUploadError = (file: File, error: AxiosError<any>) => {
    setFileUploads((prevFileUploads) =>
      prevFileUploads.map((item) =>
        item.file === file ? { ...item, error: error.message } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files) {
      setUploading(true);
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('files', files[i]);
  
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) =>
            handleUploadProgress(progressEvent, files[i]),
        };
        
        try {
          await axios.post('http://localhost:3000/upload', formData, config);
          handleUploadSuccess(files[i]);

          const socketIo = connectWebSocket();

          socketIo.disconnect();
          setUploading(false); 
        setUploadSuccess(true)
        } catch (error) {
          handleUploadError(files[i], error as AxiosError<any>);
          setUploading(false);
        }
      }
    }
  };

  return (
    <div className="container mx-auto mt-10 flex flex-col justify-center items-center h-screen">
      {!uploadSuccess && (
        <form onSubmit={handleSubmit}>
          <input type="file" name="files" multiple onChange={handleFileChange} />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold m-4 py-2 px-4 mt-4 rounded"
          >
            Upload
          </button>
        </form>
      )}

     <div className="mt-8 p-8 text-center">
        {
          uploading && 
          <p className="text-2xl font-bold text-yellow-500">
            Arquivos sendo enviados. Você pode continuar navegando pelo aplicativo.
          </p>
        }
      </div>
      
      <div className="fixed bottom-0 right-0 m-4">
        {fileUploads.map((fileUpload) => (
          <div key={fileUpload.id} className="mt-4">
            <div className="relative">
              {fileUpload.success ? (
                <div className="bg-green-500 text-white p-2 rounded">
                  Upload concluído com sucesso!
                </div>
              ) : (
                <div className="bg-blue-400 text-white p-2 rounded animate-pulse">
                  Enviando...
                </div>
              )}
              {fileUpload.file.name} -{' '}
              {fileUpload.error && <p style={{ color: 'red' }}>{fileUpload.error}</p>}
              {fileUpload.progress !== undefined && (
                <progress value={fileUpload.progress} max="100">
                  {fileUpload.progress}%
                </progress>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;



