import express from "express";
import * as paymentController from "../controllers/payment.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/webhook", paymentController.handleWebhook);

router.post(
  "/order/:bookingId",
  verifyToken,
  paymentController.createOrder
);

router.post("/verify", verifyToken, paymentController.verifyPayment);

router.get(
  "/status/:bookingId",
  verifyToken,
  paymentController.getPaymentStatus
);

export default router;
