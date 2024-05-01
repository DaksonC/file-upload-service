import React, { useEffect, useState } from 'react';
import axios, { AxiosError, AxiosProgressEvent } from 'axios';
import FileUploadProgress from './FileUploadProgress';

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

  useEffect(() => {
    const fetchInitialProgress = async () => {
      try {
        const response = await axios.get<{ progress: number }>(`http://localhost:3000/upload/${fileUploads[0]?.id}/progress`);
        const initialProgress = response.data.progress;

        setFileUploads((prevFileUploads) =>
          prevFileUploads.map((item) => ({ ...item, progress: initialProgress }))
        );

      } catch (error) {
        console.info('Error fetching initial progress:', error);
      }
    };
    fetchInitialProgress();
  }, [fileUploads]);

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
        } catch (error) {
          handleUploadError(files[i], error as AxiosError<any>);
        }
      }
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <form onSubmit={handleSubmit}>
        <input type="file" name="files" multiple onChange={handleFileChange} />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 rounded"
        >
          Upload
        </button>
      </form>
      {fileUploads.map((item, index) => (
        <div key={index} className="mt-4">
          <FileUploadProgress
            bytesProcessed={item.bytesProcessed}
            fileSize={item.file.size}
            totalProgress={totalProgress}
          />
          {item.success && <p style={{ color: 'green' }}>Upload successful</p>}
          {item.error && <p style={{ color: 'red' }}>Error: {item.error}</p>}
        </div>
      ))}
    </div>
  );
};

export default App;



