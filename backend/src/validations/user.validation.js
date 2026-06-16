import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  phone: Joi.string().min(10).max(15),
  profileImage: Joi.string().uri().allow(""),
});

export const uploadProfileImageSchema = Joi.object({
  // file validation handled by multer; schema here for future body fields
});
