import API from "./api"; // your shared axios instance already uses VITE_API_URL

export const getInstructorCourses = () => API.get("/courses/instructor/my-courses");
export const createCourse         = (data) => API.post("/courses", data);
export const submitCourse         = (courseId) => API.patch(`/courses/${courseId}/submit`);
export const deleteCourse         = (courseId) => API.delete(`/courses/${courseId}`);
export const getLessonsByCourse   = (courseId) => API.get(`/lessons?courseId=${courseId}`);
export const createLesson         = (data) => API.post("/lessons", data);
export const updateLesson         = (lessonId, data) => API.put(`/lessons/${lessonId}`, data);
export const deleteLesson         = (lessonId) => API.delete(`/lessons/${lessonId}`);