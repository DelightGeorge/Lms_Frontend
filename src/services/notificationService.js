// src/services/notificationService.js
import API from "./api";

export const getNotifications  = ()    => API.get("/notifications");
export const getUnreadCount    = ()    => API.get("/notifications/unread");
export const markOneRead       = (id)  => API.patch(`/notifications/${id}/read`);
export const markAllRead       = ()    => API.patch("/notifications/read-all");
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);
export const deleteAll         = ()    => API.delete("/notifications/all");
