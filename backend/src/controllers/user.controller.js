import userService from "../services/user.service.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateProfile(req.user.id, req.body);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image file is required",
      });
    }

    // Save image path to database
    const imagePath = `profiles/${req.file.filename}`;
    const updatedUser = await userService.uploadProfileImage(
      req.user.id,
      imagePath
    );

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      data: {
        profileImage: updatedUser.profileImage,
        user: updatedUser,
      },
    });
  } catch (error) {
    // Delete uploaded file if there's an error saving to database
    if (req.file) {
      const fs = await import("fs");
      fs.default.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const deleteProfileImage = async (req, res, next) => {
  try {
    const updatedUser = await userService.deleteProfileImage(req.user.id);

    res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
