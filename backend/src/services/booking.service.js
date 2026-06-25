import mongoose from "mongoose";
import Room from "../model/Room.js";
import * as bookingRepo from "../repositories/booking.repository.js";
import * as paymentRepo from "../repositories/payment.repository.js";
import { AppError } from "../utils/AppError.js";
import { PAYMENT_HOLD_MINUTES } from "../config/razorpay.js";

const parseDates = (checkIn, checkOut) => {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new AppError("Invalid check-in or check-out date", 400);
  }

  if (startDate >= endDate) {
    throw new AppError("Check-out date must be after check-in date", 400);
  }

  return { startDate, endDate };
};

const calculateTotal = (room, startDate, endDate) => {
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
  );
  const totalAmount = days * room.pricePerDay;
  return { days, totalAmount };
};

export const createBooking = async (
  userId,
  { roomId, checkInDate, checkOutDate, checkIn, checkOut, guests = 1 }
) => {
  const resolvedCheckIn = checkInDate || checkIn;
  const resolvedCheckOut = checkOutDate || checkOut;

  if (!roomId || !resolvedCheckIn || !resolvedCheckOut) {
    throw new AppError(
      "roomId, checkIn/checkInDate, and checkOut/checkOutDate are required",
      400
    );
  }

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new AppError("Invalid roomId", 400);
  }

  await bookingRepo.expireStalePendingBookings();

  const room = await Room.findById(roomId);
  if (!room) throw new AppError("Room not found", 404);
  if (room.status !== "active") {
    throw new AppError("Only active rooms can be booked", 400);
  }

  const { startDate, endDate } = parseDates(resolvedCheckIn, resolvedCheckOut);

  const overlap = await bookingRepo.findOverlappingBooking(
    roomId,
    startDate,
    endDate
  );
  if (overlap) {
    throw new AppError("Room is already booked for the selected dates", 400);
  }

  const { days, totalAmount } = calculateTotal(room, startDate, endDate);
  if (totalAmount <= 0) {
    throw new AppError("Invalid booking amount", 400);
  }

  const paymentExpiresAt = new Date(
    Date.now() + PAYMENT_HOLD_MINUTES * 60 * 1000
  );

  const booking = await bookingRepo.create({
    userId,
    roomId,
    checkIn: startDate,
    checkOut: endDate,
    totalDays: days,
    totalAmount,
    guests: Number(guests),
    bookingStatus: "PENDING",
    paymentStatus: "PENDING",
    paymentExpiresAt,
  });

  const payment = await paymentRepo.create({
    bookingId: booking._id,
    userId,
    amount: totalAmount,
    currency: "INR",
    status: "PENDING",
  });

  return { booking, payment };
};

export const getMyBookings = async (userId) =>
  bookingRepo.findByUser(userId);

export const getBookingById = async (bookingId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking id", 400);
  }

  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new AppError("Booking not found", 404);

  if (booking.userId._id?.toString() !== userId && booking.userId.toString() !== userId) {
    throw new AppError("You are not authorized to view this booking", 403);
  }

  const payment = await paymentRepo.findByBookingId(bookingId);
  return { booking, payment };
};

export const cancelBooking = async (bookingId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking id", 400);
  }

  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new AppError("Booking not found", 404);

  const ownerId =
    booking.userId._id?.toString() || booking.userId.toString();
  if (ownerId !== userId) {
    throw new AppError("You are not authorized to cancel this booking", 403);
  }

  if (booking.bookingStatus === "CANCELLED") {
    throw new AppError("Booking is already cancelled", 400);
  }

  if (booking.bookingStatus === "COMPLETED") {
    throw new AppError("Completed bookings cannot be cancelled", 400);
  }

  const updated = await bookingRepo.updateById(bookingId, {
    bookingStatus: "CANCELLED",
  });

  const payment = await paymentRepo.findByBookingId(bookingId);
  if (payment && payment.status === "PENDING") {
    await paymentRepo.updateById(payment._id, { status: "FAILED" });
  }

  return updated;
};

export const getOwnerBookings = async (userId) => {
  const rooms = await Room.find({ ownerId: userId });
  const roomIds = rooms.map((r) => r._id);
  return await bookingRepo.findByOwnerRooms(roomIds);
};
