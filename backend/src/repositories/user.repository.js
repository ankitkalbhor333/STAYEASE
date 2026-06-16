import User from "../model/User.js";

class UserRepository {
  async findById(id) {
    return User.findById(id).select("-password");
  }

  async updateProfile(id, data) {
    return User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).select("-password");
  }
}

export default new UserRepository();
