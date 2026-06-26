import Booking from "../model/Booking.js";

const blockingStatuses = ["CONFIRMED"];

export const create = (data) => Booking.create(data);

export const findById = (id) =>
  Booking.findById(id).populate("roomId").populate("userId", "name email");

export const findByUser = (userId) =>
  Booking.find({ userId }).populate("roomId").sort({ createdAt: -1 });

export const findByOwnerRooms = (roomIds) =>
  Booking.find({ roomId: { $in: roomIds } })
    .populate("roomId")
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

export const updateById = (id, data) =>
  Booking.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const findOverlappingBooking = (roomId, startDate, endDate, session = null) => {
  const now = new Date();

  const query = Booking.findOne({
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

  if (session) {
    query.session(session);
  }

  return query;
};

export const findBlockedDatesForRoom = async (roomId) => {
  const now = new Date();
  return Booking.find({
    roomId,
    $or: [
      { bookingStatus: "CONFIRMED" },
      {
        bookingStatus: "PENDING",
        paymentExpiresAt: { $gt: now },
      },
    ],
  }).select("checkIn checkOut");
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
