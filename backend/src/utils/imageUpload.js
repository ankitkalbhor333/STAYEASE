import cloudinary from "./cloudinary.js";
import fs from "fs";

/**
 * Upload a single image file to Cloudinary
 * @param {Object} file - Multer file object
 * @param {String} folder - Cloudinary folder path (e.g., "stayease/rooms")
 * @returns {Promise} - { imageUrl, publicId }
 */
export const uploadImageToCloudinary = async (file, folder = "stayease/rooms") => {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  // Multer memory storage should provide a Buffer
  if (!file.buffer) {
    throw new Error(`File buffer is missing. File: ${file.originalname || "<unknown>"}, Size: ${file.size || 0}, Mimetype: ${file.mimetype || "<unknown>"}`);
  }

  if (file.buffer.length === 0) {
    throw new Error(`Empty file buffer for ${file.originalname || "<unknown>"}`);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve({
            imageUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            size: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    stream.end(file.buffer);
  });
};

/**
 * Upload multiple image files to Cloudinary
 * @param {Array} files - Array of multer file objects
 * @param {String} folder - Cloudinary folder path
 * @returns {Promise} - Array of { imageUrl, publicId, ... }
 */
export const uploadImagesToCloudinary = async (files, folder = "stayease/rooms") => {
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  // Limit to 10 images
  if (files.length > 10) {
    throw new Error("Maximum 10 images allowed");
  }

  try {
    const uploadPromises = files.map((file) =>
      uploadImageToCloudinary(file, folder)
    );
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};

/**
 * Delete an image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise} - Deletion result
 */
export const deleteImageFromCloudinary = async (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(new Error(`Cloudinary delete failed: ${error.message}`));
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public IDs
 * @returns {Promise} - Array of deletion results
 */
export const deleteImagesFromCloudinary = async (publicIds) => {
  if (!publicIds || publicIds.length === 0) {
    return [];
  }

  try {
    const deletePromises = publicIds.map((publicId) =>
      deleteImageFromCloudinary(publicId)
    );
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    throw new Error(`Failed to delete images: ${error.message}`);
  }
};

/**
 * Get image URL from Cloudinary public ID with transformations
 * @param {String} publicId - Cloudinary public ID
 * @param {Object} transformations - Cloudinary transformations
 * @returns {String} - Transformed image URL
 */
export const getTransformedImageUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    fetch_format: "auto",
    quality: "auto",
    width: 800,
    height: 600,
    crop: "fill",
    ...transformations,
  };

  return cloudinary.url(publicId, defaultTransformations);
};

/**
 * Optimize image URL for different scenarios
 */
export const getOptimizedImageUrls = (publicId) => {
  return {
    thumbnail: getTransformedImageUrl(publicId, {
      width: 150,
      height: 150,
      crop: "fill",
    }),
    card: getTransformedImageUrl(publicId, {
      width: 300,
      height: 200,
      crop: "fill",
    }),
    medium: getTransformedImageUrl(publicId, {
      width: 600,
      height: 400,
      crop: "fill",
    }),
    large: getTransformedImageUrl(publicId, {
      width: 1200,
      height: 800,
      crop: "fill",
    }),
    original: cloudinary.url(publicId, { fetch_format: "auto", quality: "auto" }),
  };
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (file) => {
  const allowedMimetypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (!file) {
    throw new Error("No file provided");
  }

  if (!allowedMimetypes.includes(file.mimetype)) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedMimetypes.join(", ")}`
    );
  }

  // Max 5MB per image
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File size must not exceed 5MB");
  }

  return true;
};

/**
 * Validate multiple image files
 */
export const validateImageFiles = (files) => {
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  if (files.length > 10) {
    throw new Error("Maximum 10 images allowed");
  }

  files.forEach((file) => {
    validateImageFile(file);
  });

  return true;
};

/**
 * Clean up temporary files (if using disk storage)
 */
export const cleanupTempFiles = (files) => {
  if (!files || files.length === 0) return;

  files.forEach((file) => {
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};
