import crypto from "crypto";
import mongoose from "mongoose";
import razorpay from "../config/razorpay.js";
import * as bookingRepo from "../repositories/booking.repository.js";
import * as paymentRepo from "../repositories/payment.repository.js";
import { AppError } from "../utils/AppError.js";

const toPaise = (amountInRupees) => Math.round(amountInRupees * 100);

const assertBookingOwner = (booking, userId) => {
  const ownerId =
    booking.userId._id?.toString() || booking.userId.toString();
  if (ownerId !== userId) {
    throw new AppError("You are not authorized for this booking", 403);
  }
};

const confirmBookingPayment = async (payment, razorpayPaymentId, webhookEventId) => {
  if (payment.status === "SUCCESS") {
    return payment;
  }

  const booking = await bookingRepo.findById(payment.bookingId);
  if (!booking) throw new AppError("Booking not found for payment", 404);

  if (booking.bookingStatus === "CANCELLED") {
    throw new AppError("Cannot confirm payment for a cancelled booking", 400);
  }

  await paymentRepo.updateById(payment._id, {
    status: "SUCCESS",
    razorpayPaymentId,
    ...(webhookEventId && { webhookEventId }),
  });

  await bookingRepo.updateById(booking._id, {
    bookingStatus: "CONFIRMED",
    paymentStatus: "PAID",
    paymentExpiresAt: null,
  });

  return paymentRepo.findById(payment._id);
};

export const createOrder = async (bookingId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking id", 400);
  }

  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new AppError("Booking not found", 404);

  assertBookingOwner(booking, userId);

  if (booking.bookingStatus !== "PENDING") {
    throw new AppError("Only pending bookings can create a payment order", 400);
  }

  if (booking.paymentExpiresAt && booking.paymentExpiresAt <= new Date()) {
    throw new AppError("Payment window has expired. Please create a new booking", 400);
  }

  let payment = await paymentRepo.findByBookingId(bookingId);
  if (!payment) {
    throw new AppError("Payment record not found for booking", 404);
  }

  if (payment.status === "SUCCESS") {
    throw new AppError("Payment already completed for this booking", 400);
  }

  if (payment.razorpayOrderId) {
    return {
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      bookingId: booking._id,
      paymentId: payment._id,
    };
  }

  const order = await razorpay.orders.create({
    amount: toPaise(payment.amount),
    currency: payment.currency || "INR",
    receipt: `booking_${booking._id.toString().slice(-8)}`,
    notes: {
      bookingId: booking._id.toString(),
      userId: userId.toString(),
    },
  });

  payment = await paymentRepo.updateById(payment._id, {
    razorpayOrderId: order.id,
    status: "PENDING",
  });

  return {
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    amount: payment.amount,
    currency: payment.currency,
    bookingId: booking._id,
    paymentId: payment._id,
  };
};

export const verifyPayment = async (
  userId,
  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError("Missing Razorpay payment verification fields", 400);
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new AppError("Invalid payment signature", 400);
  }

  const payment = await paymentRepo.findByOrderId(razorpay_order_id);
  if (!payment) throw new AppError("Payment not found for order", 404);

  if (payment.userId.toString() !== userId) {
    throw new AppError("You are not authorized to verify this payment", 403);
  }

  const confirmed = await confirmBookingPayment(
    payment,
    razorpay_payment_id
  );

  const booking = await bookingRepo.findById(confirmed.bookingId);

  return { payment: confirmed, booking };
};

export const handleWebhook = async (rawBody, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new AppError("Webhook secret not configured", 500);
  }

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    throw new AppError("Invalid webhook signature", 400);
  }

  const event = JSON.parse(rawBody);
  const eventId = event.event_id || event.id;

  if (eventId) {
    const existing = await paymentRepo.findByWebhookEventId(eventId);
    if (existing) {
      return { duplicate: true, payment: existing };
    }
  }

  const eventType = event.event;
  const payload = event.payload?.payment?.entity;

  if (!payload) {
    return { handled: false, message: "No payment payload" };
  }

  const payment = await paymentRepo.findByOrderId(payload.order_id);
  if (!payment) {
    return { handled: false, message: "Payment not found" };
  }

  if (eventType === "payment.captured" || eventType === "order.paid") {
    const confirmed = await confirmBookingPayment(
      payment,
      payload.id,
      eventId
    );
    return { handled: true, payment: confirmed };
  }

  if (eventType === "payment.failed") {
    await paymentRepo.updateById(payment._id, {
      status: "FAILED",
      razorpayPaymentId: payload.id,
      ...(eventId && { webhookEventId: eventId }),
    });
    return { handled: true, payment };
  }

  return { handled: false, message: `Unhandled event: ${eventType}` };
};

export const getPaymentByBookingId = async (bookingId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking id", 400);
  }

  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new AppError("Booking not found", 404);

  assertBookingOwner(booking, userId);

  const payment = await paymentRepo.findByBookingId(bookingId);
  if (!payment) throw new AppError("Payment not found", 404);

  return { booking, payment };
};
