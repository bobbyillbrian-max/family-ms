const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const GridFSBucket = require('mongodb').GridFSBucket;
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/family-management';
mongoose.connect(MONGODB_URI);

const conn = mongoose.connection;
let gfsBucket;

conn.once('open', () => {
  console.log('Connected to MongoDB');
  gfsBucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });
});

// Family Schema
const familySchema = new mongoose.Schema({
  family_name: { type: String, required: true },
  password_hash: { type: String, required: true },
  admin_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// User Schema
const userSchema = new mongoose.Schema({
  family_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
  full_name: { type: String, required: true },
  relationship: { type: String, required: true },
  has_children: { type: Boolean, default: false },
  date_of_birth: { type: Date },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  password_hash: { type: String, required: true },
  profile_photo: { type: String },
  gallery_photos: [{ type: String }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Document Schema
const documentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  original_filename: { type: String, required: true },
  file_path: { type: String, required: true },
  file_size: { type: Number, required: true },
  file_type: { type: String, required: true },
  category: { type: String, required: true },
  is_shared: { type: Boolean, default: false },
  upload_date: { type: Date, default: Date.now }
});

const Family = mongoose.model('Family', familySchema);
const User = mongoose.model('User', userSchema);
const Document = mongoose.model('Document', documentSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: File type not allowed!');
    }
  }
});

// Routes

// Family Registration
app.post('/api/families/register', async (req, res) => {
  try {
    const { family_name, password, admin_name, admin_relationship, admin_has_children, admin_password } = req.body;

    // Check if family name already exists
    const existingFamily = await Family.findOne({ family_name });
    if (existingFamily) {
      return res.status(400).json({ error: 'Family name already exists' });
    }

    // Hash family password
    const familyPasswordHash = await bcrypt.hash(password, 12);

    // Create family
    const family = new Family({
      family_name,
      password_hash: familyPasswordHash
    });

    const savedFamily = await family.save();

    // Hash admin password
    const adminPasswordHash = await bcrypt.hash(admin_password, 12);

    // Create admin user
    const admin = new User({
      family_id: savedFamily._id,
      full_name: admin_name,
      relationship: admin_relationship,
      has_children: admin_has_children,
      role: 'admin',
      password_hash: adminPasswordHash
    });

    const savedAdmin = await admin.save();

    // Add admin to family admin_ids
    savedFamily.admin_ids.push(savedAdmin._id);
    await savedFamily.save();

    res.status(201).json({ 
      message: 'Family created successfully',
      family_id: savedFamily._id,
      admin_id: savedAdmin._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Family Login
app.post('/api/families/login', async (req, res) => {
  try {
    const { family_name, password } = req.body;

    const family = await Family.findOne({ family_name });
    if (!family) {
      return res.status(400).json({ error: 'Family not found' });
    }

    const isMatch = await bcrypt.compare(password, family.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Get family members
    const members = await User.find({ family_id: family._id }).select('-password_hash');

    res.json({
      family: {
        _id: family._id,
        family_name: family.family_name,
        admin_ids: family.admin_ids
      },
      members
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login
app.post('/api/users/login', async (req, res) => {
  try {
    const { user_id, password } = req.body;

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { user_id: user._id, family_id: user.family_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password_hash;

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create User Profile
app.post('/api/users/create', async (req, res) => {
  try {
    const { family_id, full_name, relationship, has_children, date_of_birth, password } = req.body;

    // Validate password
    if (password.length < 6 || !/\d/.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters with at least one number' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = new User({
      family_id,
      full_name,
      relationship,
      has_children,
      date_of_birth: date_of_birth || null,
      password_hash: passwordHash
    });

    const savedUser = await user.save();

    const userWithoutPassword = { ...savedUser.toObject() };
    delete userWithoutPassword.password_hash;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Family Members
app.get('/api/families/:family_id/members', authenticateToken, async (req, res) => {
  try {
    const { family_id } = req.params;
    
    const members = await User.find({ family_id }).select('-password_hash');
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload File
app.post('/api/upload/:type', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type } = req.params;
    const { category, is_shared } = req.body;

    const filename = `${Date.now()}_${req.file.originalname}`;
    
    const uploadStream = gfsBucket.openUploadStream(filename, {
      metadata: {
        user_id: req.user.user_id,
        type: type,
        original_filename: req.file.originalname
      }
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async () => {
      if (type === 'document') {
        const document = new Document({
          user_id: req.user.user_id,
          filename,
          original_filename: req.file.originalname,
          file_path: uploadStream.id,
          file_size: req.file.size,
          file_type: req.file.mimetype,
          category: category || 'Other',
          is_shared: is_shared === 'true'
        });

        await document.save();
      } else if (type === 'photo') {
        const { photo_type } = req.body; // 'profile' or 'gallery'
        
        if (photo_type === 'profile') {
          await User.findByIdAndUpdate(req.user.user_id, {
            profile_photo: filename
          });
        } else if (photo_type === 'gallery') {
          const user = await User.findById(req.user.user_id);
          if (user.gallery_photos.length < 4) {
            user.gallery_photos.push(filename);
            await user.save();
          }
        }
      }

      res.json({
        message: 'File uploaded successfully',
        filename,
        fileId: uploadStream.id
      });
    });

    uploadStream.on('error', (error) => {
      console.error(error);
      res.status(500).json({ error: 'Upload failed' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get File
app.get('/api/files/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    const downloadStream = gfsBucket.openDownloadStreamByName(filename);
    
    downloadStream.on('error', (error) => {
      res.status(404).json({ error: 'File not found' });
    });
    
    downloadStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get User Documents
app.get('/api/users/:user_id/documents', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Users can only see their own documents unless they're viewing shared ones
    let query = { user_id };
    
    if (req.user.user_id !== user_id) {
      query = { user_id, is_shared: true };
    }

    const documents = await Document.find(query).populate('user_id', 'full_name');
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Document Sharing
app.patch('/api/documents/:doc_id/sharing', authenticateToken, async (req, res) => {
  try {
    const { doc_id } = req.params;
    const { is_shared } = req.body;

    const document = await Document.findOne({ _id: doc_id, user_id: req.user.user_id });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    document.is_shared = is_shared;
    await document.save();

    res.json({ message: 'Document sharing updated', document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Shared Documents
app.get('/api/families/:family_id/shared-documents', authenticateToken, async (req, res) => {
  try {
    const { family_id } = req.params;
    
    const users = await User.find({ family_id }).select('_id');
    const userIds = users.map(user => user._id);
    
    const sharedDocuments = await Document.find({
      user_id: { $in: userIds },
      is_shared: true
    }).populate('user_id', 'full_name relationship');
    
    res.json(sharedDocuments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});