import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, User, X, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PhotoUpload: React.FC = () => {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.profile_photo) {
        setProfilePhoto(`http://localhost:3001/api/files/${user.profile_photo}`);
      }
      setGalleryPhotos(user.gallery_photos.map(photo => `http://localhost:3001/api/files/${photo}`));
    }
  }, [user]);

  const handlePhotoUpload = async (file: File, type: 'profile' | 'gallery') => {
    if (!token) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('photo_type', type);

      const response = await fetch('http://localhost:3001/api/upload/photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const photoUrl = `http://localhost:3001/api/files/${data.filename}`;
        
        if (type === 'profile') {
          setProfilePhoto(photoUrl);
          setSuccess('Profile photo updated successfully!');
        } else {
          if (galleryPhotos.length < 4) {
            setGalleryPhotos(prev => [...prev, photoUrl]);
            setSuccess('Gallery photo added successfully!');
          }
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file, 'profile');
    }
  };

  const handleGalleryPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && galleryPhotos.length < 4) {
      handlePhotoUpload(file, 'gallery');
    }
  };

  return (
    <div className="space-y-8">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Profile Photo */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-gray-400" />
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => profileInputRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {profilePhoto ? 'Change Photo' : 'Upload Photo'}
            </button>
            <p className="text-sm text-gray-500 mt-1">
              JPG, PNG or GIF (Max 10MB)
            </p>
            <input
              ref={profileInputRef}
              type="file"
              onChange={handleProfilePhotoChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Gallery Photos */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Personal Gallery</h3>
          <span className="text-sm text-gray-500">{galleryPhotos.length}/4 photos</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryPhotos.map((photo, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={photo}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
          
          {galleryPhotos.length < 4 && (
            <div
              onClick={() => galleryInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : (
                <>
                  <Camera className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Add Photo</span>
                </>
              )}
            </div>
          )}
        </div>
        
        <input
          ref={galleryInputRef}
          type="file"
          onChange={handleGalleryPhotoChange}
          accept="image/*"
          className="hidden"
        />
        
        <p className="text-sm text-gray-500 mt-4">
          Upload up to 4 personal photos. These are private by default but can be shared with family.
        </p>
      </div>
    </div>
  );
};

export default PhotoUpload;