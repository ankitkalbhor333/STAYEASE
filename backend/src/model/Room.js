import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    // Basic Information

    title: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      maxlength: 3000,
    },

    propertyType: {
      type: String,
      enum: [
        "Apartment",
        "House",
        "Villa",
        "PG",
        "Hostel",
        "Flat",
        "Room",
      ],
    },

    roomType: {
      type: String,
      enum: ["Entire Place", "Private Room", "Shared Room"],
    },

    // Location

    country:{
        type: String,
    } ,

    state: {
      type: String,
      index: true,
    },

    city: {
      type: String,
      index: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },

    area: String,

    fullAddress: String,

    pincode: String,

    phoneNumber: {
      type: String,
    },

    // Pricing

    pricePerDay: {
      type: Number,
      min: 0,
      index: true,
    },

    pricePerWeek: Number,

    pricePerMonth: Number,

    cleaningFee: {
      type: Number,
      default: 0,
    },

    securityDeposit: {
      type: Number,
      default: 0,
    },

    // Capacity

    maxGuests: {
      type: Number,
      min: 1,
    },

    bedrooms: {
      type: Number,
      min: 1,
    },

    beds: {
      type: Number,
      min: 1,
    },

    bathrooms: {
      type: Number,
      min: 1,
    },
    // Amenities

    amenities: {
      wifi: {
        type: Boolean,
        default: false,
      },

      kitchen: {
        type: Boolean,
        default: false,
      },

      parking: {
        type: Boolean,
        default: false,
      },  

      washingMachine: {
        type: Boolean,
        default: false,
      },

      airConditioner: {
        type: Boolean,
        default: false,
      },

      tv: {
        type: Boolean,
        default: false,
      },

      geyser: {
        type: Boolean,
        default: false,
      }
    },

    // Images

    images: [imageSchema],

    // Availability

    availableFrom: {
      type: Date,
    },

    availableTo: {
      type: Date,
    },

    // Owner

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Ratings

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // Status & Step Tracking

    status: {
      type: String,
      enum: ["draft", "active", "inactive", "deleted"],
      default: "draft",
      index: true,
    },

    completedSteps: {
      type: [String],
      enum: ["basic", "location", "pricing", "capacity", "amenities", "images", "availability"],
      default: [],
    },

    currentStep: {
      type: String,
      enum: ["basic", "location", "pricing", "capacity", "amenities", "images", "availability"],
      default: "basic",
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    lastSavedAt: {
      type: Date,
      default: Date.now,
    },

    // Workspace (for future multi-listing feature)
    workspace: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
    },
  }

  ,{
    timestamps: true,
  }
);

roomSchema.index({
  city: 1,
  state: 1,
  propertyType: 1,
  pricePerDay: 1,
  location: "2dsphere"
});


export default mongoose.model("Room", roomSchema);