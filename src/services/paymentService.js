// src/services/paymentService.js
import API from "./api";

export const initializePayment = (courseId, couponCode, referral) =>
  API.post("/payments/initialize", { courseId, couponCode, referral });

export const verifyPayment = (reference) =>
  API.get(`/payments/verify/${reference}`);

export const freeEnroll = (courseId) =>
  API.post("/payments/enroll/free", { courseId });

export const getPaymentHistory = () =>
  API.get("/payments/history");
