import Booking from "../model/Booking.js";

const blockingStatuses = ["CONFIRMED"];

export const create = (data) => Booking.create(data);

export const findById = (id) =>
  Booking.findById(id).populate("roomId").populate("userId", "name email");

export const findByUser = (userId) =>
  Booking.find({ userId }).populate("roomId").sort({ createdAt: -1 });

export const updateById = (id, data) =>
  Booking.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const findOverlappingBooking = (roomId, startDate, endDate) => {
  const now = new Date();

  return Booking.findOne({
    roomId,
    $or: [
      { bookingStatus: { $in: blockingStatuses } },
      {
        bookingStatus: "PENDING",
        paymentExpiresAt: { $gt: now },
      },
    ],
    checkIn: { $lt: endDate },
    checkOut: { $gt: startDate },
  });
};

export const expireStalePendingBookings = async () => {
  const now = new Date();
  return Booking.updateMany(
    {
      bookingStatus: "PENDING",
      paymentExpiresAt: { $lte: now },
    },
    {
      $set: {
        bookingStatus: "CANCELLED",
        paymentStatus: "PENDING",
      },
    }
  );
};
