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

  return (
    <Layout>
      {/* extra padding for CTA + bottom nav */}
      <div className="min-h-screen bg-[#f8f9fb] pb-40 sm:pb-0 overflow-x-hidden">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16 sm:py-20 lg:py-32">
          <div className="absolute top-0 -right-20 w-96 h-96 bg-blue-500 blur-3xl opacity-20" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500 blur-3xl opacity-20" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm">
                <TrendingUp size={16} />
                <span>New: AI-Powered Learning Paths</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight">
                Unlock your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  potential.
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-lg">
                Join millions of learners mastering skills that matter today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search for courses..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white outline-none"
                  />
                </div>

                <Link to="/courses">
                  <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg">
                    Explore
                  </button>
                </Link>
              </div>
            </div>

            {/* HERO IMAGE */}
            <div className="hidden lg:block">
              <div className="bg-white/5 border border-white/10 p-4 rounded-3xl rotate-3 hover:rotate-0 transition">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                  alt="Learning"
                  className="rounded-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow flex gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <CheckCircle />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">
                      Verified Experts
                    </p>
                    <p className="font-bold text-slate-900">800+ Instructors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-20">
          {/* BUILD YOUR SKILLS */}
          <section className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm overflow-hidden">
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Build your skills
              </h2>
              <p className="text-slate-600 mt-1">
                Pick a topic and start learning today.
              </p>
            </div>

            {/* TABS */}
            <div className="flex flex-wrap gap-3 border-b border-slate-200 mb-8 justify-center sm:justify-start">
              {["Python", "Excel", "Web Design", "AWS", "Marketing"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 pb-2 font-bold text-sm border-b-2 ${
                      activeTab === tab
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-400"
                    }`}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>

            {/* COURSES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((id) => (
                <CourseCard key={id} id={id} />
              ))}
            </div>
          </section>
        </main>

        {/* 📱 MOBILE STICKY CTA */}
        <div className="fixed bottom-16 inset-x-0 sm:hidden z-40 px-4">
          <Link to="/signup">
            <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl">
              Start free trial · {activeTab}
            </button>
          </Link>
        </div>

        {/* 💻 DESKTOP FLOATING CTA */}
        <div className="hidden sm:block fixed bottom-8 right-8 z-40">
          <Link to="/signup">
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              Start free trial <ArrowRight size={18} />
            </button>
          </Link>
        </div>

        {/* 🤖 ASSISTANT BOT */}
        <div className="fixed bottom-24 right-6 sm:bottom-28 sm:right-10 z-40">
          <button className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition">
            🤖
          </button>
        </div>

        {/* 📱 MOBILE BOTTOM NAV */}
        <nav className="fixed bottom-0 inset-x-0 bg-white border-t sm:hidden z-50">
          <div className="flex justify-around py-3">
            <BottomNavItem
              to="/"
              icon={<HomeIcon />}
              label="Home"
              active={location.pathname === "/"}
            />
            <BottomNavItem to="/courses" icon={<Layers />} label="Courses" />
            <BottomNavItem
              to="/categories"
              icon={<BookOpen />}
              label="Categories"
            />
            <BottomNavItem to="/profile" icon={<User />} label="Profile" />
          </div>
        </nav>
      </div>
    </Layout>
  );
};

/* COURSE CARD */
const CourseCard = ({ id }) => (
  <Link to={`/courses/${id}`} className="block">
    <div className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition">
      <img
        src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80"
        alt="course"
        className="w-full h-44 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold line-clamp-2">Advanced Python & Algorithms</h3>
        <p className="text-sm text-slate-500">Colt Steele</p>
        <div className="flex items-center gap-2 mt-2 text-sm">
          <span className="text-orange-600 font-bold">4.9</span>
          <Star size={14} className="text-orange-400" />
          <span className="text-slate-400">(42k)</span>
        </div>
        <p className="mt-2 font-bold">$14.99</p>
      </div>
    </div>
  </Link>
);

/* BOTTOM NAV ITEM */
const BottomNavItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex flex-col items-center text-xs ${
      active ? "text-blue-600 font-bold" : "text-slate-500"
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Home;
