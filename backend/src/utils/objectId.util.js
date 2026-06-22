import mongoose from "mongoose";
import { AppError } from "./AppError.js";

export const assertValidObjectId = (id, fieldName = "id") => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
};

export const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));
