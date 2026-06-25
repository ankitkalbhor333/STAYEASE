import express from "express";
import * as bookingController from "../controllers/booking.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, bookingController.createBooking);
router.get("/my-bookings", verifyToken, bookingController.getMyBookings);
router.get("/owner/bookings", verifyToken, bookingController.getOwnerBookings);
router.get("/:id", verifyToken, bookingController.getBookingById);
router.patch("/cancel/:id", verifyToken, bookingController.cancelBooking);

export default router;
