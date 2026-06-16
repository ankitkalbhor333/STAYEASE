const mongoose = require("mongoose");

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
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
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
      required: true,
    },

    roomType: {
      type: String,
      enum: ["Entire Place", "Private Room", "Shared Room"],
      required: true,
    },

    // Location

    country:{
        type: String,
 
    } ,

    state: {
      type: String,
      required: true,
      index: true,
    },

    city: {
      type: String,
      required: true,
      index: true,
    },

    area: String,

    fullAddress: String,

    pincode: String,

    phoneNumber:{
      type:String,
      required:true,
    },


    // Pricing

    pricePerDay: {
      type: Number,
      required: true,
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
      required: true,
      min: 1,
    },

    bedrooms: {
      type: Number,
      required: true,
      min: 1,
    },

    beds: {
      type: Number,
      required: true,
      min: 1,
    }
,
   bathrooms: {
      type: Number,
      required: true,
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
      required: true,},

    availableTo: {
      type:Date,
      required: true,
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

    // Status

    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({
  city: 1,
  state: 1,
  propertyType: 1,
  pricePerDay: 1,
});

module.exports = mongoose.model("Room", roomSchema);