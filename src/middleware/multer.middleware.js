import dotenv from 'dotenv';
dotenv.config();

// Import Cloudinary and configure it
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log configuration to verify
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage for profile images
const storage1 = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile-images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

// Set up Cloudinary storage for team logos
const storage2 = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'team-logo',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

// Create multer instances
export const upload1 = multer({ storage: storage1 });
export const upload2 = multer({ storage: storage2 });