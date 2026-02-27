import API from "./api";

export const enrollFree      = (courseId)  => API.post("/enrollments/free", { courseId });
export const checkEnrollment = (courseId)  => API.get(`/enrollments/check/${courseId}`);
export const getMyEnrollments = ()         => API.get("/enrollments/my");