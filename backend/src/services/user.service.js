import userRepository from "../repositories/user.repository.js";

class UserService {
  async getProfile(userId) {
    return userRepository.findById(userId);
  }

  async updateProfile(userId, data) {
    return userRepository.updateProfile(userId, data);
  }
}

export default new UserService();
