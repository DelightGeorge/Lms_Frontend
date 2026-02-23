import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getInstructorCourses = () => API.get("/courses/instructor/my-courses");
export const createCourse = (data) => API.post("/courses", data);
export const submitCourse = (courseId) => API.patch(`/courses/${courseId}/submit`);
export const deleteCourse = (courseId) => API.delete(`/courses/${courseId}`);
export const getLessonsByCourse = (courseId) => API.get(`/lessons?courseId=${courseId}`);
export const createLesson = (data) => API.post("/lessons", data);
export const updateLesson = (lessonId, data) => API.put(`/lessons/${lessonId}`, data);
export const deleteLesson = (lessonId) => API.delete(`/lessons/${lessonId}`);
