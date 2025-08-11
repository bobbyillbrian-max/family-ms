import React from 'react';
import { User as UserIcon, Shield, Heart } from 'lucide-react';
import { User } from '../../types';

interface MemberCardProps {
  member: User;
  profileImage: string | null;
  isCurrentUser: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, profileImage, isCurrentUser }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border transition-all hover:shadow-md ${
      isCurrentUser ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
    }`}>
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
          {profileImage ? (
            <img
              src={profileImage}
              alt={member.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="h-8 w-8 text-gray-400" />
          )}
        </div>
        
        <h3 className="font-semibold text-gray-900 text-lg mb-1">{member.full_name}</h3>
        
        <div className="flex items-center justify-center space-x-1 mb-2">
          <Heart className="h-4 w-4 text-pink-500" />
          <span className="text-gray-600 text-sm">{member.relationship}</span>
        </div>

        {member.role === 'admin' && (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
            <Shield className="h-3 w-3" />
            <span>Admin</span>
          </span>
        )}

        {isCurrentUser && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            You
          </span>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            {member.has_children && (
              <span className="flex items-center">
                <UserIcon className="h-3 w-3 mr-1" />
                Has children
              </span>
            )}
            {member.date_of_birth && (
              <span>
                Born {new Date(member.date_of_birth).getFullYear()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;