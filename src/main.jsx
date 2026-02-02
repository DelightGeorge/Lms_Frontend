import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";

import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import CourseList from "./pages/Courses/CourseList.jsx";
import CourseDetail from "./pages/Courses/CourseDetail.jsx";
import LessonPlayer from "./pages/Learning/LessonPlayer.jsx";
import StudentDashboard from "./pages/Dashboard/StudentDashboard.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import InstructorDashboard from "./pages/Instructor/InstructorDashboard.jsx";
import Business from "./pages/Categories/Business.jsx";
import Categories from "./pages/Categories/Categories.jsx";
import Development from "./pages/Categories/Development.jsx";
import Marketing from "./pages/Categories/Marketing.jsx";
import Design from "./pages/Categories/Design.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // layout (Navbar + Footer)
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "auth",
        element: <Auth />,
      },
      {
        path: "courses",
        element: <CourseList />,
      },
      {
        path: "courses/:id",
        element: <CourseDetail />,
      },
      {
        path: "lessonplayer",
        element: <LessonPlayer />,
      },
      {
        path: "StudentDashboard",
        element: <StudentDashboard />,
      },
      {
        path: "admindashboard",
        element: <AdminDashboard />,
      },
      {
        path: "instructordashboard",
        element: <InstructorDashboard />,
      },
      {
        path: "categories/",
        element: <Categories />, // main categories page
        children: [
          { path: "development", element: <Development /> },
          { path: "business", element: <Business /> },
          { path: "design", element: <Design /> },
          { path: "marketing", element: <Marketing /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
