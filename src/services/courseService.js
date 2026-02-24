import API from "./api";

export const getAllCourses     = ()           => API.get("/courses");
export const getCourseById    = (id)          => API.get(`/courses/${id}`);
export const getAllCategories  = ()           => API.get("/categories");