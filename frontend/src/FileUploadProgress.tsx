import React, { useEffect, useState } from 'react';

interface FileUploadProgressProps {
  bytesProcessed: number;
  fileSize: number;
  totalProgress: number;
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  bytesProcessed,
  fileSize,
  totalProgress,
}) => {
  const [progress, setProgress] = useState(0);
  const [displayedMegabytes, setDisplayedMegabytes] = useState(0);
  const [animationDelay, setAnimationDelay] = useState('0s');

  useEffect(() => {
    const calculatedMegabytes = (bytesProcessed / (1024 * 1024)).toFixed(2);

    setProgress(totalProgress);
    setAnimationDelay('0.2s');
    setDisplayedMegabytes(parseFloat(calculatedMegabytes));
  }, [bytesProcessed, totalProgress]);

  return (
    <div>
      <div className="h-4 w-full bg-gray-300 rounded-full mb-2 relative overflow-hidden">
        <div
          className="h-4 bg-blue-500 rounded-full"
          style={{
            width: `${progress}%`,
            transition: `width 0.5s ease-in-out`,
          }}
        >
          <div
            className="absolute top-0 left-0 w-full h-full bg-blue-500 opacity-50"
            style={{
              transform: `translateX(-${100 - progress}%)`,
              transition: `transform ${animationDelay} ease-in-out`,
            }}
          ></div>
        </div>
      </div>
      <p>{displayedMegabytes} MB</p>
    </div>
  );
};

export default FileUploadProgress;

