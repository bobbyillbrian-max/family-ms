export interface Family {
  _id: string;
  family_name: string;
  admin_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  _id: string;
  family_id: string;
  full_name: string;
  relationship: string;
  has_children: boolean;
  date_of_birth?: string;
  role: 'admin' | 'member';
  profile_photo?: string;
  gallery_photos: string[];
  created_at: string;
  updated_at: string;
}

export interface Document {
  _id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: string;
  is_shared: boolean;
  upload_date: string;
}

export interface AuthContextType {
  family: Family | null;
  user: User | null;
  token: string | null;
  familyMembers: User[];
  login: (family: Family, members: User[]) => void;
  userLogin: (user: User, token: string) => void;
  logout: () => void;
}</parameter>