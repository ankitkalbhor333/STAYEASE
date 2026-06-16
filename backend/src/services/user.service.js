import userRepository from "../repositories/user.repository.js";
import { deleteProfileImage } from "../config/multer.js";

class UserService {
  async getProfile(userId) {
    return userRepository.findById(userId);
  }

  async updateProfile(userId, data) {
    return userRepository.updateProfile(userId, data);
  }

  async uploadProfileImage(userId, imagePath) {
    // Get current user to check if there's an existing image
    const user = await userRepository.findById(userId);
    
    // Delete old image if it exists
    if (user?.profileImage) {
      deleteProfileImage(user.profileImage);
    }

    // Convert Windows path to URL-friendly path
    const normalizedPath = imagePath.replace(/\\/g, "/");
    
    // Update user with new image path
    const updatedUser = await userRepository.updateProfile(userId, {
      profileImage: normalizedPath,
    });

    return updatedUser;
  }

  async deleteProfileImage(userId) {
    const user = await userRepository.findById(userId);
    
    if (!user?.profileImage) {
      throw new Error("No profile image found");
    }

    // Delete file from filesystem
    deleteProfileImage(user.profileImage);

    // Remove image path from database
    const updatedUser = await userRepository.updateProfile(userId, {
      profileImage: "",
    });

    return updatedUser;
  }
}

export default new UserService();
