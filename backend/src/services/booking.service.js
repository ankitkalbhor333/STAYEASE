import mongoose from "mongoose";
import Room from "../model/Room.js";
import Booking from "../model/Booking.js";
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

const roomLocks = new Map();

const acquireLock = async (roomId) => {
  while (roomLocks.has(roomId)) {
    await roomLocks.get(roomId);
  }
  let resolveLock;
  const lockPromise = new Promise((resolve) => {
    resolveLock = resolve;
  });
  roomLocks.set(roomId, lockPromise);
  return () => {
    if (roomLocks.get(roomId) === lockPromise) {
      roomLocks.delete(roomId);
    }
    resolveLock();
  };
};

export const createBooking = async (
  userId,
  { roomId, checkInDate, checkOutDate, checkIn, checkOut, guests = 1 }
) => {
  const resolvedCheckIn = checkInDate || checkIn;
  const resolvedCheckOut = checkOutDate || checkOut;

  if (!roomId || !resolvedCheckIn || !resolvedCheckOut) {
    throw new AppError(
      "roomId, checkInDate, and checkOutDate are required",
      400
    );
  }

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new AppError("Invalid roomId", 400);
  }

  // Acquire local serialization lock for this room
  const release = await acquireLock(roomId);
  let session = null;

  try {
    // 1. Parse and validate dates basic ordering
    const { startDate, endDate } = parseDates(resolvedCheckIn, resolvedCheckOut);

    // Reject past dates (must be today or later in UTC)
    const now = new Date();
    const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const bookingStartUTC = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());

    if (bookingStartUTC < todayUTC) {
      throw new AppError("Check-in date cannot be in the past", 400);
    }

    // Clean stale pending bookings hold window first (non-transactional maintenance)
    await bookingRepo.expireStalePendingBookings();

    // Start MongoDB Session for Transaction if possible
    try {
      session = await mongoose.startSession();
    } catch (err) {
      console.warn("[Transaction Warning] MongoDB Session/ReplicaSet not supported in this environment. Falling back to non-transactional execution.");
    }

    if (session) {
      session.startTransaction();
    }

    // 2. Fetch Room (inside transaction if available)
    const roomQuery = Room.findById(roomId);
    if (session) {
      roomQuery.session(session);
    }
    const room = await roomQuery;

    if (!room) throw new AppError("Room not found", 404);

    // 3. Check Room is active
    if (room.status !== "active") {
      throw new AppError("Room is currently inactive and cannot be booked", 400);
    }

    // 4. Validate Guests capacity
    if (Number(guests) > room.maxGuests) {
      throw new AppError(`Guests count exceeds room capacity of ${room.maxGuests} guests`, 400);
    }

    // 5. Check within Owner Availability range
    if (!room.availableFrom || !room.availableTo) {
      throw new AppError("Room availability dates are not configured by the host", 400);
    }

    const availFrom = new Date(room.availableFrom);
    const availTo = new Date(room.availableTo);

    const availFromUTC = Date.UTC(availFrom.getUTCFullYear(), availFrom.getUTCMonth(), availFrom.getUTCDate());
    const availToUTC = Date.UTC(availTo.getUTCFullYear(), availTo.getUTCMonth(), availTo.getUTCDate());

    const checkInUTC = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
    const checkOutUTC = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());

    if (checkInUTC < availFromUTC || checkOutUTC > availToUTC) {
      throw new AppError("Selected dates fall outside the room's availability range set by host", 400);
    }

    // 6. Overlap checking (inside transaction if available)
    const overlap = await bookingRepo.findOverlappingBooking(
      roomId,
      startDate,
      endDate,
      session
    );
    if (overlap) {
      throw new AppError("Room is already booked for the selected dates", 400);
    }

    // Calculate pricing
    const { days, totalAmount } = calculateTotal(room, startDate, endDate);
    if (totalAmount <= 0) {
      throw new AppError("Invalid booking amount", 400);
    }

    const paymentExpiresAt = new Date(
      Date.now() + PAYMENT_HOLD_MINUTES * 60 * 1000
    );

    const bookingOpts = session ? { session } : {};

    // Create Booking
    let booking;
    if (session) {
      const createdBookings = await Booking.create([{
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
      }], bookingOpts);
      booking = createdBookings[0];
    } else {
      booking = await Booking.create({
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
    }

    // Create Payment reference
    const payment = await paymentRepo.create({
      bookingId: booking._id,
      userId,
      amount: totalAmount,
      currency: "INR",
      status: "PENDING",
    }, bookingOpts);

    if (session) {
      await session.commitTransaction();
    }

    return { booking, payment };
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
    release();
  }
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

export const checkRoomAvailability = async ({ roomId, checkIn, checkOut, guests = 1 }) => {
  if (!roomId || !checkIn || !checkOut) {
    throw new AppError("roomId, checkIn, and checkOut are required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new AppError("Invalid roomId", 400);
  }

  const room = await Room.findById(roomId);
  if (!room) throw new AppError("Room not found", 404);

  if (room.status !== "active") {
    return { available: false, reason: "Room is currently inactive" };
  }

  if (Number(guests) > room.maxGuests) {
    return { available: false, reason: `Guests count exceeds room capacity of ${room.maxGuests}` };
  }

  const { startDate, endDate } = parseDates(checkIn, checkOut);

  // Reject past dates
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const bookingStartUTC = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());

  if (bookingStartUTC < todayUTC) {
    return { available: false, reason: "Check-in date cannot be in the past" };
  }

  if (!room.availableFrom || !room.availableTo) {
    return { available: false, reason: "Room availability dates are not configured by host" };
  }

  const availFrom = new Date(room.availableFrom);
  const availTo = new Date(room.availableTo);

  const availFromUTC = Date.UTC(availFrom.getUTCFullYear(), availFrom.getUTCMonth(), availFrom.getUTCDate());
  const availToUTC = Date.UTC(availTo.getUTCFullYear(), availTo.getUTCMonth(), availTo.getUTCDate());

  const checkInUTC = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
  const checkOutUTC = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());

  if (checkInUTC < availFromUTC || checkOutUTC > availToUTC) {
    return { available: false, reason: "Selected dates fall outside the room's availability window" };
  }

  const overlap = await bookingRepo.findOverlappingBooking(roomId, startDate, endDate);
  if (overlap) {
    return { available: false, reason: "Room is already booked for the selected dates" };
  }

  return { available: true };
};

export const getRoomAvailabilityCalendar = async (roomId) => {
  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new AppError("Invalid roomId", 400);
  }

  const room = await Room.findById(roomId);
  if (!room) throw new AppError("Room not found", 404);

  const blockedBookings = await bookingRepo.findBlockedDatesForRoom(roomId);
  const blockedRanges = blockedBookings.map(b => ({
    checkIn: b.checkIn,
    checkOut: b.checkOut
  }));

  return {
    availableFrom: room.availableFrom,
    availableTo: room.availableTo,
    status: room.status,
    blockedRanges
  };
};
