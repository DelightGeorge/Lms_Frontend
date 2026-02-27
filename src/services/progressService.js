import API from "./api";

export const markLessonComplete = (lessonId)  => API.post("/progress/complete", { lessonId });
export const getCourseProgress  = (courseId)  => API.get(`/progress/${courseId}`);