import API from "./api";

export const initializePayment = (courseId)   => API.post("/payments/initialize", { courseId });
export const verifyPayment     = (reference)  => API.get(`/payments/verify/${reference}`);