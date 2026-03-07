// src/services/notificationService.js
import API from "./api";

// ── General notifications (used by Navbar, Notifications page) ───────────────
export const getNotifications     = ()    => API.get("/notifications");
export const getUnreadCount       = ()    => API.get("/notifications/unread");
export const markOneRead          = (id)  => API.patch(`/notifications/${id}/read`);
export const markAllRead          = ()    => API.patch("/notifications/read-all");
export const markNotificationAsRead = (id) => API.patch(`/notifications/${id}/read`);
export const deleteNotification   = (id)  => API.delete(`/notifications/${id}`);
export const deleteAll            = ()    => API.delete("/notifications/all");
export const getAdminNotifications = ()   => API.get("/notifications");

// ── Admin: course approvals (used by AdminDashboard) ─────────────────────────
export const getPendingCourses    = ()              => API.get("/courses/pending");
export const getPendingCoursesCount = ()            => API.get("/courses/pending/count");
export const approveCourse        = (courseId)      => API.patch(`/courses/${courseId}/approve`);
export const rejectCourse         = (courseId, reason) =>
  API.patch(`/courses/${courseId}/reject`, { reason });