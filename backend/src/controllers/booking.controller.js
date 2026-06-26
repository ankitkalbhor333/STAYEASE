import * as bookingService from "../services/booking.service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const sendSuccess = (res, { status = 200, message, data }) =>
  res.status(status).json({ success: true, message, data });

export const createBooking = asyncHandler(async (req, res) => {
  const { booking, payment } = await bookingService.createBooking(
    req.user.id,
    req.body
  );

  sendSuccess(res, {
    status: 201,
    message:
      "Booking created. Complete payment within the hold window to confirm.",
    data: { booking, payment },
  });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getMyBookings(req.user.id);
  sendSuccess(res, {
    message: "Bookings fetched successfully",
    data: bookings,
  });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const result = await bookingService.getBookingById(req.params.id, req.user.id);
  sendSuccess(res, {
    message: "Booking fetched successfully",
    data: result,
  });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(
    req.params.id,
    req.user.id
  );
  sendSuccess(res, {
    message: "Booking cancelled successfully",
    data: booking,
  });
});

export const getOwnerBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getOwnerBookings(req.user.id);
  sendSuccess(res, {
    message: "Owner bookings fetched successfully",
    data: bookings,
  });
});

export const checkAvailability = asyncHandler(async (req, res) => {
  const { roomId, checkIn, checkOut, guests } = req.body;
  const result = await bookingService.checkRoomAvailability({
    roomId,
    checkIn,
    checkOut,
    guests,
  });
  
  res.status(200).json({
    success: true,
    message: result.available ? "Dates are available for booking" : result.reason,
    data: result,
  });
});

export const getRoomAvailabilityCalendar = asyncHandler(async (req, res) => {
  const result = await bookingService.getRoomAvailabilityCalendar(req.params.id);
  sendSuccess(res, {
    message: "Room availability calendar fetched successfully",
    data: result,
  });
});
