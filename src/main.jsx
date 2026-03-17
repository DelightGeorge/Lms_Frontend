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
import InstructorPublicProfile from "./pages/InstructorPublicProfile.jsx";
import InstructorsPage from "./pages/InstructorsPage.jsx";
import PageLoader from "./Components/PageLoader.jsx";
import ForBusinesses from "./pages/ForBusinesses.jsx";
import Pricing from "./pages/Pricing.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import Careers from "./pages/Careers.jsx";
import Blog from "./pages/Blog.jsx";
import Press from "./pages/Press.jsx";
import HelpCenter from "./pages/HelpCenter.jsx";
import Community from "./pages/Community.jsx";
import Documentation from "./pages/Documentation.jsx";
import ApiReference from "./pages/ApiReference.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import Cookies from "./pages/Cookies.jsx";
import Contact from "./pages/Contact.jsx";

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
        path: "/instructors/:instructorId",
        element: <InstructorPublicProfile />,
      },
      { path: "/instructors", element: <InstructorsPage /> },
      { path: "/instructor/wallet", element: <WalletPage /> },
      { path: "/for-instructors", element: <ForInstructors /> },
      { path: "/for-businesses", element: <ForBusinesses /> },
      { path: "/pricing", element: <Pricing /> },
      { path: "/about", element: <AboutUs /> },
      { path: "/careers", element: <Careers /> },
      { path: "/blog", element: <Blog /> },
      { path: "/press", element: <Press /> },
      { path: "/help", element: <HelpCenter /> },
      { path: "/community", element: <Community /> },
      { path: "/docs", element: <Documentation /> },
      { path: "/api-reference", element: <ApiReference /> },
      { path: "/terms", element: <Terms /> },
      { path: "/privacy", element: <Privacy /> },
      { path: "/cookies", element: <Cookies /> },
      { path: "/contact", element: <Contact /> },
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
      <PageLoader />
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
