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
    const filename = `${req.user.id}-${timestamp}${ext}`;
    cb(null, filename);
  },
});

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
