import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Video, Image } from 'lucide-react';
import { caseAPI } from '../lib/apiService';
import { useAuth } from '../lib/AuthContext';

interface CaseMediaUploadProps {
  caseId: number;
  onMediaUpload?: (media: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const LOW_BANDWIDTH_WARNING_SIZE = 50 * 1024 * 1024; // 50MB

export const CaseMediaUpload: React.FC<CaseMediaUploadProps> = ({
  caseId,
  onMediaUpload,
  onError,
  disabled = false,
}) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lowBandwidthWarning, setLowBandwidthWarning] = useState(false);

  const generateFileId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const getMediaType = (file: File): 'IMAGE' | 'VIDEO' | null => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) return 'IMAGE';
    if (ALLOWED_VIDEO_TYPES.includes(file.type)) return 'VIDEO';
    return null;
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 100MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      };
    }

    if (!getMediaType(file)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload images (JPEG, PNG, GIF, WebP) or videos (MP4, MOV, AVI, WebM)',
      };
    }

    if (file.size > LOW_BANDWIDTH_WARNING_SIZE) {
      setLowBandwidthWarning(true);
    }

    return { valid: true };
  };

  const uploadFile = async (file: File, fileId: string) => {
    try {
      setUploadProgress((prev) => {
        const newMap = new Map(prev);
        newMap.set(fileId, {
          fileId,
          fileName: file.name,
          progress: 0,
          status: 'uploading',
        });
        return newMap;
      });

      // Simulate upload progress (real implementation would use XMLHttpRequest for progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(fileId);
          if (current && current.progress < 90) {
            newMap.set(fileId, { ...current, progress: current.progress + 10 });
          }
          return newMap;
        });
      }, 200);

      const result = await caseAPI.uploadMedia(caseId, file, description, user?.id);

      clearInterval(progressInterval);

      setUploadProgress((prev) => {
        const newMap = new Map(prev);
        newMap.set(fileId, {
          fileId,
          fileName: file.name,
          progress: 100,
          status: 'complete',
        });
        return newMap;
      });

      // Auto-remove completed upload after 3 seconds
      setTimeout(() => {
        setUploadProgress((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });
      }, 3000);

      if (onMediaUpload) {
        onMediaUpload(result);
      }

      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setUploadProgress((prev) => {
        const newMap = new Map(prev);
        newMap.set(fileId, {
          fileId,
          fileName: file.name,
          progress: 0,
          status: 'error',
          error: errorMsg,
        });
        return newMap;
      });

      if (onError) {
        onError(`Failed to upload ${file.name}: ${errorMsg}`);
      }
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        if (onError) {
          onError(`${file.name}: ${validation.error}`);
        }
        return;
      }

      const fileId = generateFileId();
      uploadFile(file, fileId);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeProgress = (fileId: string) => {
    setUploadProgress((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  return (
    <div className="rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Media</h2>

      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
          id="media-upload-input"
        />

        <label htmlFor="media-upload-input" className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'} style={{ display: 'block' }}>
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-10 h-10 text-gray-400" />
            <div>
              <p className="text-gray-700 font-medium">Drag and drop your media here</p>
              <p className="text-gray-500 text-sm">or click to browse</p>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Supported: Images (JPEG, PNG, GIF, WebP) and Videos (MP4, MOV, AVI, WebM) up to 100MB
            </p>
          </div>
        </label>
      </div>

      {/* Browse Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Choose Files or Videos
        </button>
      </div>

      {/* Low Bandwidth Warning */}
      {lowBandwidthWarning && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Large file detected</p>
            <p className="text-xs text-yellow-700">
              Files larger than 50MB may take longer to upload on slower connections.
            </p>
          </div>
        </div>
      )}

      {/* Description Input */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Media Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description for this media..."
          disabled={disabled}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          rows={2}
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress.size > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-medium text-gray-700">Upload Progress</h3>
          {Array.from(uploadProgress.values()).map((item) => (
            <div key={item.fileId} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  {item.status === 'uploading' && (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin" />
                  )}
                  {item.status === 'complete' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {item.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{item.fileName}</p>
                    {item.error && <p className="text-xs text-red-600">{item.error}</p>}
                  </div>
                </div>

                {item.status !== 'uploading' && (
                  <button
                    onClick={() => removeProgress(item.fileId)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    item.status === 'complete'
                      ? 'bg-green-500'
                      : item.status === 'error'
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">{item.progress}%</p>
            </div>
          ))}
        </div>
      )}

      {/* File Type Info */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Image className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">Image Formats</p>
          </div>
          <p className="text-xs text-blue-700">JPEG, PNG, GIF, WebP</p>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Video className="w-4 h-4 text-purple-600" />
            <p className="text-sm font-medium text-purple-900">Video Formats</p>
          </div>
          <p className="text-xs text-purple-700">MP4, MOV, AVI, WebM</p>
        </div>
      </div>
    </div>
  );
};

export default CaseMediaUpload;
