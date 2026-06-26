import api from "../api/axios";

export const createBookingAPI = (bookingData) => {
  return api.post("/bookings", bookingData);
};

export const getMyBookingsAPI = () => {
  return api.get("/bookings/my-bookings");
};

export const getBookingByIdAPI = (id) => {
  return api.get(`/bookings/${id}`);
};

export const cancelBookingAPI = (id) => {
  return api.patch(`/bookings/cancel/${id}`);
};

export const createPaymentOrderAPI = (bookingId) => {
  return api.post(`/payments/order/${bookingId}`);
};

export const verifyPaymentAPI = (paymentData) => {
  return api.post("/payments/verify", paymentData);
};

export const getPaymentStatusAPI = (bookingId) => {
  return api.get(`/payments/status/${bookingId}`);
};

export const checkAvailabilityAPI = (data) => {
  return api.post("/bookings/check-availability", data);
};

export const getRoomAvailabilityCalendarAPI = (roomId) => {
  return api.get(`/bookings/room/${roomId}/availability`);
};
