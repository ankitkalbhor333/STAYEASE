import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    facilities: {
      type: [String],
      default: [],
    },

    images: {
      type: [String],
      default: [],
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "PENDING"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({
  location: "2dsphere",
});

const Room = mongoose.model("Room", roomSchema);

export default Room;