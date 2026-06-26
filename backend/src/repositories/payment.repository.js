import Payment from "../model/Payment.js";

export const create = (data, options = {}) => {
  if (options.session) {
    return Payment.create(Array.isArray(data) ? data : [data], options).then(res => res[0]);
  }
  return Payment.create(data);
};

export const findById = (id) =>
  Payment.findById(id).populate("bookingId").populate("userId", "name email");

export const findByBookingId = (bookingId) =>
  Payment.findOne({ bookingId }).sort({ createdAt: -1 });

export const findByOrderId = (razorpayOrderId) =>
  Payment.findOne({ razorpayOrderId });

export const findByWebhookEventId = (webhookEventId) =>
  Payment.findOne({ webhookEventId });

export const updateById = (id, data) =>
  Payment.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const updateByOrderId = (razorpayOrderId, data) =>
  Payment.findOneAndUpdate({ razorpayOrderId }, data, {
    new: true,
    runValidators: true,
  });
