import API from "./api";

export const getAdminStats      = ()         => API.get("/admin/stats");
export const getAnalytics       = ()         => API.get("/admin/analytics");
export const getPendingCourses  = ()         => API.get("/admin/courses/pending");
export const getAllCourses       = ()         => API.get("/admin/courses/all");
export const getCourseDetail    = (id)       => API.get(`/admin/courses/${id}`);
export const reviewCourse       = (id, data) => API.patch(`/admin/courses/${id}/review`, data);
export const editCourse         = (id, data) => API.patch(`/admin/courses/${id}/edit`, data);
export const deleteCourse       = (id)       => API.delete(`/admin/courses/${id}`);
export const getAllUsers         = ()         => API.get("/admin/users");
export const deleteUser         = (id)       => API.delete(`/admin/users/${id}`);