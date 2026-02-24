import API from "./api";

export const getInstructorCourses   = ()                   => API.get("/courses/instructor/my-courses");
export const createCourse           = (data)               => API.post("/courses", data);
export const updateCourse           = (id, data)           => API.patch(`/courses/${id}`, data);
export const deleteCourse           = (id)                 => API.delete(`/courses/${id}`);
export const submitCourse           = (id)                 => API.patch(`/courses/${id}/submit`);
export const getLessonsByCourse     = (courseId)           => API.get(`/lessons/course/${courseId}`);
export const createLesson           = (data)               => API.post("/lessons", data);
export const updateLesson           = (id, data)           => API.patch(`/lessons/${id}`, data);
export const deleteLesson           = (id)                 => API.delete(`/lessons/${id}`);
export const addResource            = (data)               => API.post("/resources", data);
export const getResourcesByCourse   = (courseId)           => API.get(`/resources/course/${courseId}`);