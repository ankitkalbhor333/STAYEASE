import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads");
const profileDir = path.join(uploadDir, "profiles");

// Create directories if they don't exist
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

// Allowed image extensions
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const ALLOWED_MIMETYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "-");
    const filename = `${req.user?.id || "unknown"}-${timestamp}${ext}`;
    cb(null, filename);
  },
});

/**
 * Memory storage for temporary image uploads
 * Used in multi-step room creation to upload to Cloudinary
 * Avoids storing files on disk
 */
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_MIMETYPES.join(", ")}`), false);
    return;
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new Error(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`), false);
    return;
  }

  cb(null, true);
};

/**
 * Disk storage upload
 * Used for profile pictures and general file uploads
 */
const diskUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * Memory storage upload
 * Used for multi-step room creation (images uploaded directly to Cloudinary)
 */
const memoryUpload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 10, // Max 10 images
  },
});

/**
 * Export default as memory upload for room creation
 * This avoids storing files on disk since they go directly to Cloudinary
 */
export default memoryUpload;

/**
 * Export both options
 */
export { diskUpload, memoryUpload };
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// Utility function to delete old profile image
export const deleteProfileImage = (imagePath) => {
  if (!imagePath) return;
  
  try {
    const fullPath = path.join(uploadDir, imagePath.replace(/\\/g, "/"));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted image: ${fullPath}`);
    }
  } catch (error) {
    console.error(`Error deleting image: ${error.message}`);
  }
};

export default upload;
