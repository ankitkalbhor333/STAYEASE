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
