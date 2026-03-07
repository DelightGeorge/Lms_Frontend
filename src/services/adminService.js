// src/services/adminService.js
import API from "./api";

/**
 * ─────────────────────────────────────────────────────────
 * STATS & ANALYTICS
 * ─────────────────────────────────────────────────────────
 */
export const getAdminStats = () => API.get("/admin/stats");
export const getAnalytics = () => API.get("/admin/analytics");

/**
 * ─────────────────────────────────────────────────────────
 * COURSES MANAGEMENT
 * ─────────────────────────────────────────────────────────
 */

// Get all pending (PENDING_REVIEW) courses
export const getPendingCourses = () => API.get("/admin/courses/pending");

// Get all courses (any status)
export const getAllCourses = () => API.get("/admin/courses/all");

// Get single course details
export const getCourseDetail = (id) => API.get(`/admin/courses/${id}`);

/**
 * Review a course (approve/reject)
 * @param {string} id - Course ID
 * @param {object} data - { status: "PUBLISHED" | "REJECTED", rejectionReason?: string }
 * @returns Promise
 */
export const reviewCourse = (id, data) =>
  API.patch(`/admin/courses/${id}/review`, data);

// Edit course details
export const editCourse = (id, data) => API.patch(`/admin/courses/${id}/edit`, data);

// Delete course
export const deleteCourse = (id) => API.delete(`/admin/courses/${id}`);

/**
 * ─────────────────────────────────────────────────────────
 * USERS MANAGEMENT
 * ─────────────────────────────────────────────────────────
 */

// Get all users
export const getAllUsers = () => API.get("/admin/users");

// Delete user
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

/**
 * ─────────────────────────────────────────────────────────
 * INSTRUCTOR APPLICATIONS (if needed)
 * ─────────────────────────────────────────────────────────
 */

// These endpoints would exist if you want to manage instructor applications
// export const getPendingApplications = () => API.get("/admin/applications/pending");
// export const approveApplication = (id) => API.patch(`/admin/applications/${id}/approve`);
// export const rejectApplication = (id, reason) => API.patch(`/admin/applications/${id}/reject`, { reason });

/**
 * ─────────────────────────────────────────────────────────
 * PAYOUT REQUESTS (if needed)
 * ─────────────────────────────────────────────────────────
 */

// These endpoints would exist if you want to manage payouts
// export const getPendingPayouts = () => API.get("/admin/payouts/pending");
// export const approvePayout = (id) => API.patch(`/admin/payouts/${id}/approve`);
// export const rejectPayout = (id, reason) => API.patch(`/admin/payouts/${id}/reject`, { reason });
