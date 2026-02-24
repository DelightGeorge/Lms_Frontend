import API from "./api";

export const getAdminStats = () => API.get("/admin/stats");
export const getPendingCourses = () => API.get("/admin/courses/pending");
export const getAllCourses = () => API.get("/admin/courses/all");
export const reviewCourse = (id, data) =>
  API.patch(`/admin/courses/${id}/approve`, data);
export const getAllUsers = () => API.get("/admin/users");
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
