import React, { useState } from 'react';
import { Trash2, Download, Eye, EyeOff, Calendar, User, HardDrive } from 'lucide-react';
import { caseAPI } from '../lib/apiService';
import { useAuth } from '../lib/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8888/api';

// Helper function to construct full media URL
const getMediaUrl = (fileUrl: string): string => {
  if (!fileUrl) return '';
  
  // If it's already a full URL, return as-is
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  
  // If it's already an API path like /api/case-media/..., prepend only the base (protocol + host)
  if (fileUrl.startsWith('/api/case-media/')) {
    const apiBaseWithoutPath = 'http://localhost:8888';
    return `${apiBaseWithoutPath}${fileUrl}`;
  }
  
  // If it's an old-style file path like uploads/case-2/filename, convert it
  // This handles both forward and backward slashes
  if (fileUrl.includes('uploads') || fileUrl.includes('case-')) {
    // Extract caseId and filename from path
    const match = fileUrl.match(/case-(\d+)[/\\](.+)$/);
    if (match) {
      const caseId = match[1];
      const filename = match[2];
      return `${API_BASE}/case-media/${caseId}/${filename}`;
    }
  }
  
  // Fallback: treat as relative API path
  return `${API_BASE}${fileUrl}`;
};

interface CaseMedia {
  id: number;
  caseId: number;
  mediaType: 'IMAGE' | 'VIDEO';
  fileUrl: string;
  fileName: string;
  description?: string;
  fileSizeBytes: number;
  uploadedAt: string;
  uploadedByUserId: number;
}

interface CaseMediaPreviewProps {
  media: CaseMedia[];
  caseId: number;
  canDelete?: boolean;
  onMediaDelete?: (mediaId: number) => void;
  onError?: (error: string) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export const CaseMediaPreview: React.FC<CaseMediaPreviewProps> = ({
  media,
  caseId,
  canDelete = false,
  onMediaDelete,
  onError,
}) => {
  const { user } = useAuth();
  const [selectedMedia, setSelectedMedia] = useState<CaseMedia | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (mediaId: number) => {
    if (!window.confirm('Are you sure you want to delete this media?')) return;

    setDeleting(mediaId);
    try {
      await caseAPI.deleteMedia(caseId, mediaId, user?.id);
      if (onMediaDelete) {
        onMediaDelete(mediaId);
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to delete media');
      }
    } finally {
      setDeleting(null);
    }
  };

  if (!media || media.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">No media uploaded yet</p>
      </div>
    );
  }

  const images = media.filter((m) => m.mediaType === 'IMAGE');
  const videos = media.filter((m) => m.mediaType === 'VIDEO');

  return (
    <div className="space-y-6">
      {/* Images Section */}
      {images.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Images ({images.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative bg-gray-100 aspect-square overflow-hidden">
                  <img
                    src={getMediaUrl(img.fileUrl)}
                    alt={img.fileName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EError loading image%3C/text%3E%3C/svg%3E';
                    }}
                  />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedMedia(img);
                        setIsPreviewOpen(true);
                      }}
                      className="p-2 bg-white rounded-full opacity-0 hover:opacity-100 transition-opacity hover:bg-blue-500 hover:text-white"
                      title="Preview"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(img.id)}
                        disabled={deleting === img.id}
                        className="p-2 bg-white rounded-full opacity-0 hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-700 truncate" title={img.fileName}>
                    {img.fileName}
                  </p>
                  {img.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{img.description}</p>
                  )}

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <HardDrive className="w-3 h-3" />
                      {formatFileSize(img.fileSizeBytes)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(img.uploadedAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Videos ({videos.length})</h3>
          <div className="space-y-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Video Thumbnail Placeholder */}
                  <div className="flex-shrink-0 w-32 bg-gray-100 rounded-lg overflow-hidden">
                    <div className="w-full h-24 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-10 h-10 mx-auto mb-1 bg-gray-400 rounded-full flex items-center justify-center text-white">
                          ▶
                        </div>
                        <span className="text-xs text-gray-600">Video</span>
                      </div>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate" title={video.fileName}>
                      {video.fileName}
                    </p>
                    {video.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{video.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatFileSize(video.fileSizeBytes)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(video.uploadedAt)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMedia(video);
                        setIsPreviewOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Play"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(video.id)}
                        disabled={deleting === video.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Preview Modal */}
      {isPreviewOpen && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-800 truncate">{selectedMedia.fileName}</h2>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <EyeOff className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {selectedMedia.mediaType === 'IMAGE' ? (
                <img
                  src={getMediaUrl(selectedMedia.fileUrl)}
                  alt={selectedMedia.fileName}
                  className="w-full max-h-[60vh] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EError loading image%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <video
                  src={getMediaUrl(selectedMedia.fileUrl)}
                  controls
                  className="w-full max-h-[60vh] bg-black rounded-lg"
                  onError={(e) => {
                    const mediaUrl = getMediaUrl(selectedMedia.fileUrl);
                    console.error('Error loading video:', selectedMedia.fileUrl);
                    console.error('Resolved URL:', mediaUrl);
                    console.error('Video element error:', (e.target as HTMLVideoElement).error?.message);
                  }}
                />
              )}

              {/* Metadata */}
              {selectedMedia.description && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                  <p className="text-sm text-gray-600">{selectedMedia.description}</p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">File Size</p>
                  <p className="font-medium text-gray-800">{formatFileSize(selectedMedia.fileSizeBytes)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Uploaded</p>
                  <p className="font-medium text-gray-800">{formatDate(selectedMedia.uploadedAt)}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <a
                href={selectedMedia.fileUrl}
                download={selectedMedia.fileName}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
              {canDelete && (
                <button
                  onClick={() => {
                    handleDelete(selectedMedia.id);
                    setIsPreviewOpen(false);
                  }}
                  disabled={deleting === selectedMedia.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseMediaPreview;
