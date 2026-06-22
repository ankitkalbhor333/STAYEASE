import * as paymentService from "../services/payment.service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const sendSuccess = (res, { status = 200, message, data }) =>
  res.status(status).json({ success: true, message, data });

export const createOrder = asyncHandler(async (req, res) => {
  const order = await paymentService.createOrder(
    req.params.bookingId,
    req.user.id
  );
  sendSuccess(res, {
    message: "Razorpay order created successfully",
    data: order,
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.verifyPayment(req.user.id, req.body);
  sendSuccess(res, {
    message: "Payment verified and booking confirmed",
    data: result,
  });
});

export const getPaymentStatus = asyncHandler(async (req, res) => {
  const result = await paymentService.getPaymentByBookingId(
    req.params.bookingId,
    req.user.id
  );
  sendSuccess(res, {
    message: "Payment status fetched successfully",
    data: result,
  });
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.rawBody;

  if (!rawBody) {
    return res.status(400).json({
      success: false,
      message: "Raw body required for webhook verification",
    });
  }

  const result = await paymentService.handleWebhook(rawBody, signature);
  res.status(200).json({ success: true, ...result });
});
