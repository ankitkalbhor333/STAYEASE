import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    totalDays: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    guests: {
      type: Number,
      required: true,
      default: 1,
    },

    bookingStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
        "COMPLETED",
      ],
      default: "PENDING",
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "REFUNDED",
      ],
      default: "PENDING",
    },

  /** Pending bookings expire if payment is not completed in time */
    paymentExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({
  roomId: 1,
  bookingStatus: 1,
});

const Booking = mongoose.model(
  "Booking",
  bookingSchema
);

export default Booking;