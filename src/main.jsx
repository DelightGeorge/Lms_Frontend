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
import Cart from "./pages/Cart.jsx";
import Notifications from "./pages/Notifications.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import PaymentVerify from "./pages/PaymentVerify.jsx";
import { AuthProvider } from "./Context/AuthContext.jsx";
import Profile from "./pages/Profile.jsx";
import WalletPage from "./pages/WalletPage.jsx";
import PaymentCallbackPage from "./pages/PaymentCallbackPage.jsx";
import CheckoutPage from "./pages/Checkout.jsx";
import CouponsPage from "./pages/CouponsPage.jsx";
import AdminPayoutsPage from "./pages/AdminPayoutsPage.jsx";
import InstructorApplicationPage from "./pages/InstructorApplicationPage.jsx";
import AdminInstructorApplicationsPage from "./pages/AdminInstructorApplicationsPage.jsx";
import CertificatePage from "./pages/CertificatePage.jsx";
import StudentProfilePage from "./pages/Student/StudentProfilePage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "auth", element: <Auth /> },
      { path: "/profile", element: <Profile /> },
      { path: "/verify-email", element: <VerifyEmail /> },
      { path: "courses", element: <CourseList /> },
      { path: "courses/:id", element: <CourseDetail /> },
      { path: "lessonplayer", element: <LessonPlayer /> },
      { path: "StudentDashboard", element: <StudentDashboard /> },
      { path: "admindashboard", element: <AdminDashboard /> },
      { path: "instructordashboard", element: <InstructorDashboard /> },
      { path: "cart", element: <Cart /> },
      { path: "notifications", element: <Notifications /> },
      { path: "payment/verify", element: <PaymentVerify /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/payment/callback", element: <PaymentCallbackPage /> },
      { path: "/instructor/wallet", element: <WalletPage /> },
      { path: "/instructor/coupons", element: <CouponsPage /> },
      { path: "/admin/payouts", element: <AdminPayoutsPage /> },
      { path: "/become-instructor", element: <InstructorApplicationPage /> },
      { path: "/certificate/:courseId", element: <CertificatePage /> },
      { path: "/student-profile", element: <StudentProfilePage /> },
      { path: "/student-profile/:userId", element: <StudentProfilePage /> },
      {
        path: "/admin/instructor-applications",
        element: <AdminInstructorApplicationsPage />,
      },
      {
        path: "categories/",
        element: <Categories />,
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
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
