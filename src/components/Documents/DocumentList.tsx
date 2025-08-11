import React from 'react';
import { FileText, Share2, Lock, ExternalLink } from 'lucide-react';
import { Document } from '../../types';

interface DocumentListProps {
  documents: Document[];
  onShareToggle: (docId: string, isShared: boolean) => void;
  loading: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onShareToggle, loading }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No documents uploaded yet</p>
          <p className="text-gray-400 text-sm">Upload your first document to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Your Documents</h3>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{doc.original_filename}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">{doc.category}</span>
                      <span className="text-sm text-gray-500">
                        {formatFileSize(doc.file_size)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onShareToggle(doc._id, !doc.is_shared)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      doc.is_shared
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {doc.is_shared ? (
                      <>
                        <Share2 className="h-3 w-3" />
                        <span>Shared</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" />
                        <span>Private</span>
                      </>
                    )}
                  </button>
                  
                  <a
                    href={`http://localhost:3001/api/files/${doc.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>View</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentList;