import api from "./axios";

export const loginUser = (data) => {
  return api.post("auth/login", data);
};

export const registerUser = (data) => {
  return api.post("/auth/register", data);
};

export const logoutUser = () => {
  return api.post("/auth/logout");
};

export const verifyEmailapi = (token) => {
  return api.get(`/auth/verify/${token}`);
};

export const forgotPasswordapi = (data) => {
  return api.post("/auth/forgot-password", data);
};

export const resetPasswordapi = (token, data) => {
  return api.post(`/auth/reset-password/${token}`, data);
};

export const resendVerificationEmail = (email) => {
  return api.post("/auth/resend-verification", { email });
};
