import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "../shared/Layout/Layout";
import {
  Search,
  Star,
  PlayCircle,
  Award,
  BookOpen,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Home as HomeIcon,
  Layers,
  User,
} from "lucide-react";

const Home = () => {
  const [activeTab, setActiveTab] = useState("Python");
  const location = useLocation();

  const categories = [
    { name: "Design", icon: <Star size={20} />, color: "bg-pink-100 text-pink-600" },
    { name: "Dev", icon: <PlayCircle size={20} />, color: "bg-blue-100 text-blue-600" },
    { name: "Business", icon: <TrendingUp size={20} />, color: "bg-emerald-100 text-emerald-600" },
    { name: "Music", icon: <Users size={20} />, color: "bg-purple-100 text-purple-600" },
    { name: "Office", icon: <BookOpen size={20} />, color: "bg-orange-100 text-orange-600" },
    { name: "Health", icon: <Award size={20} />, color: "bg-red-100 text-red-600" },
  ];

  return (
    <Layout>
      {/* padding-bottom allows room for CTA + bottom nav */}
      <div className="flex flex-col min-h-screen bg-[#f8f9fb] pb-36 sm:pb-0">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16 sm:py-20 lg:py-32">
          <div className="absolute top-0 -right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm">
                <TrendingUp size={16} />
                <span>New: AI-Powered Learning Paths available</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                Unlock your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  potential.
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-lg">
                Join 50 million learners and master the skills that matter today. Taught by industry titans.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow max-w-md">
                  <input
                    type="text"
                    placeholder="Search for 'Cloud Computing'..."
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>

                <Link to="/courses">
                  <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-500/25">
                    Explore
                  </button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-3xl rotate-3 hover:rotate-0 transition-transform">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                  alt="Students learning"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <CheckCircle />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                      Verified Experts
                    </p>
                    <p className="text-slate-900 font-bold">800+ Instructors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16 sm:space-y-24">
          {/* BUILD YOUR SKILLS SECTION */}
          <section className="py-12 sm:py-16 px-2 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-sm">
            <div className="max-w-7xl mx-auto">

              {/* HEADER */}
              <div className="mb-6 sm:mb-10 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
                  Build your skills
                </h2>
                <p className="text-slate-600 text-sm sm:text-lg">
                  Pick a topic and start your 7-day free trial.
                </p>
              </div>

              {/* TABS */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 border-b border-slate-200 mb-6 sm:mb-8 overflow-x-auto no-scrollbar px-1 md:justify-start">
                {["Python", "Excel", "Web Design", "AWS", "Marketing"].map((tab) => (
                  <button
                    key={tab}
                    className="pb-2 px-3 sm:px-4 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 border-transparent text-slate-400 hover:text-slate-600 transition-all"
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* COURSES GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {[1, 2, 3, 4].map((id) => (
                  <CourseCard key={id} id={id} />
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* 📱 STICKY MOBILE CTA */}
        <div className="fixed bottom-16 inset-x-0 sm:hidden z-40 px-4">
          <Link to="/signup">
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl backdrop-blur">
              Start free trial · {activeTab}
            </button>
          </Link>
        </div>

        {/* 📱 MOBILE BOTTOM NAV */}
        <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 sm:hidden z-50">
          <div className="flex justify-around py-3">
            <BottomNavItem to="/" icon={<HomeIcon />} label="Home" active={location.pathname === "/"} />
            <BottomNavItem to="/courses" icon={<Layers />} label="Courses" />
            <BottomNavItem to="/categories" icon={<BookOpen />} label="Categories" />
            <BottomNavItem to="/profile" icon={<User />} label="Profile" />
          </div>
        </nav>
      </div>
    </Layout>
  );
};

// COURSE CARD
const CourseCard = ({ id }) => (
  <Link to={`/courses/${id}`} className="group block">
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition">
      {/* IMAGE */}
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80"
          alt="course"
          className="w-full h-40 sm:h-44 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm">
            Bestseller
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 text-center sm:text-left">
        <span className="text-xs font-semibold uppercase text-slate-400">course</span>
        <h3 className="mt-2 font-bold text-slate-900 leading-snug mb-2 text-center sm:text-left group-hover:text-blue-600 transition-colors line-clamp-2">
          Advanced Data Structures & Algorithms in Python 2026
        </h3>
        <p className="text-sm text-slate-500 mb-2 text-center sm:text-left">
          Colt Steele, Developer
        </p>

        {/* RATING */}
        <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start text-sm">
          <span className="text-orange-600 font-black">4.9</span>
          <Star size={14} className="text-orange-400" />
          <span className="text-slate-400 text-xs">(42k reviews)</span>
        </div>

        {/* PRICE */}
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <span className="text-xl font-bold text-slate-900">$14.99</span>
          <span className="text-slate-400 line-through text-sm">$84.99</span>
        </div>
      </div>
    </div>
  </Link>
);

// BOTTOM NAV ITEM
const BottomNavItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex flex-col items-center text-xs ${active ? "text-blue-600 font-bold" : "text-slate-500"}`}
  >
    {icon}
    <span className="mt-1">{label}</span>
  </Link>
);

export default Home;
