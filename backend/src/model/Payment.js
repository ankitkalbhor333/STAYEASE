import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    razorpayOrderId: {
      type: String,
      sparse: true,
    },

    razorpayPaymentId: {
      type: String,
      sparse: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    /** Idempotency: track processed webhook event ids */
    webhookEventId: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
