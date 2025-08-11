import React, { useState, useEffect } from 'react';
import { Users, FileText, Image, Settings, LogOut, Upload, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User, Document } from '../../types';
import MemberCard from './MemberCard';
import DocumentUpload from '../Documents/DocumentUpload';
import PhotoUpload from '../Photos/PhotoUpload';
import DocumentList from '../Documents/DocumentList';

const FamilyDashboard: React.FC = () => {
  const { family, user, familyMembers, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      loadDocuments();
      loadSharedDocuments();
    }
  }, [user, token]);

  const loadDocuments = async () => {
    if (!user || !token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/users/${user._id}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSharedDocuments = async () => {
    if (!family || !token) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/families/${family._id}/shared-documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSharedDocuments(data);
      }
    } catch (error) {
      console.error('Error loading shared documents:', error);
    }
  };

  const handleDocumentUpload = () => {
    loadDocuments();
    loadSharedDocuments();
  };

  const handleShareToggle = async (docId: string, isShared: boolean) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/documents/${docId}/sharing`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_shared: isShared }),
      });

      if (response.ok) {
        loadDocuments();
        loadSharedDocuments();
      }
    } catch (error) {
      console.error('Error updating document sharing:', error);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Family Overview', icon: Users },
    { id: 'documents', name: 'My Documents', icon: FileText },
    { id: 'photos', name: 'Photos', icon: Image },
    { id: 'shared', name: 'Shared', icon: Share2 },
  ];

  if (user?.role === 'admin') {
    tabs.push({ id: 'settings', name: 'Settings', icon: Settings });
  }

  const getProfileImage = (member: User) => {
    if (member.profile_photo) {
      return `http://localhost:3001/api/files/${member.profile_photo}`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{family?.family_name}</h1>
              <p className="text-gray-600">Welcome back, {user?.full_name}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Members</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {familyMembers.map((member) => (
                      <MemberCard 
                        key={member._id} 
                        member={member}
                        profileImage={getProfileImage(member)}
                        isCurrentUser={member._id === user?._id}
                      />
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    {sharedDocuments.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No recent family activity</p>
                    ) : (
                      <div className="space-y-4">
                        {sharedDocuments.slice(0, 5).map((doc) => (
                          <div key={doc._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{doc.original_filename}</p>
                              <p className="text-sm text-gray-600">
                                Shared by {(doc.user_id as any).full_name} • {doc.category}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(doc.upload_date).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">My Documents</h2>
                  <DocumentUpload onUpload={handleDocumentUpload} />
                </div>
                <DocumentList 
                  documents={documents} 
                  onShareToggle={handleShareToggle}
                  loading={loading}
                />
              </div>
            )}

            {activeTab === 'photos' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Photo Gallery</h2>
                <PhotoUpload />
              </div>
            )}

            {activeTab === 'shared' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Shared Family Documents</h2>
                <div className="space-y-4">
                  {sharedDocuments.map((doc) => (
                    <div key={doc._id} className="bg-white rounded-lg shadow-sm p-6 border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <h3 className="font-medium text-gray-900">{doc.original_filename}</h3>
                            <p className="text-sm text-gray-600">
                              Shared by {(doc.user_id as any).full_name} • {doc.category}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(doc.upload_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={`http://localhost:3001/api/files/${doc.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                  {sharedDocuments.length === 0 && (
                    <div className="text-center py-12">
                      <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No shared documents yet</p>
                      <p className="text-gray-400 text-sm">Family members can share their documents here</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && user?.role === 'admin' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Family Settings</h2>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <p className="text-gray-600">Settings panel for family administrators</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Advanced settings and family management features coming soon.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboard;