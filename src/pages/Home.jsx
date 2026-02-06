import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "../shared/Layout/Layout";
import {
  Search,
  Star,
  TrendingUp,
  Users,
  Award,
  CheckCircle,
  BookOpen,
  Layers,
  User,
  Home as HomeIcon,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

const Home = () => {
  const [activeTab, setActiveTab] = useState("Python");
  const location = useLocation();

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8f9fb] pb-40 sm:pb-0 overflow-x-hidden">
        {/* UNIQUE HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/30 blur-3xl rounded-full" />
          <div className="absolute bottom-0 -left-24 w-96 h-96 bg-purple-500/30 blur-3xl rounded-full" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-14 items-center">
            {/* TEXT */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/20 text-sm">
                <Sparkles size={14} /> Learn smarter, not harder
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight">
                Build skills that <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  change your future
                </span>
              </h1>

              <p className="text-slate-300 max-w-xl">
                Practical courses, real projects, and expert instructors — all in one place.
              </p>

              {/* SEARCH + CTA */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search courses, skills, careers..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-4 outline-none"
                  />
                </div>
                <Link to="/courses">
                  <button className="bg-blue-600 hover:bg-blue-500 transition text-white font-bold py-4 px-8 rounded-xl shadow-lg">
                    Explore
                  </button>
                </Link>
              </div>

              {/* TRUST */}
              <div className="flex gap-6 pt-4 text-sm text-slate-300">
                <span className="flex items-center gap-1"><Users size={16}/>2M+ learners</span>
                <span className="flex items-center gap-1"><Award size={16}/>800+ instructors</span>
                <span className="flex items-center gap-1"><CheckCircle size={16}/>Verified courses</span>
              </div>
            </div>

            {/* IMAGE STACK (DESKTOP + MOBILE) */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
                alt="Learning"
                className="rounded-3xl shadow-2xl"
              />

              <div className="absolute -bottom-6 left-6 bg-white text-slate-900 rounded-2xl p-4 shadow-xl flex gap-3">
                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                  <CheckCircle />
                </div>
                <div>
                  <p className="text-xs uppercase font-bold text-slate-500">Success rate</p>
                  <p className="font-bold">94% completion</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-24">
          {/* BUILD SKILLS (RESTORED + IMPROVED) */}
          <section className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm">
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold">Build your skills</h2>
              <p className="text-slate-600">Choose a category and start learning today</p>
            </div>

            {/* TABS */}
            <div className="flex gap-4 overflow-x-auto border-b pb-2 mb-8">
              {["Python", "Excel", "Web Design", "AWS", "Marketing"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 font-bold whitespace-nowrap border-b-2 transition ${
                    activeTab === tab
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* COURSES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((id) => (
                <CourseCard key={id} id={id} />
              ))}
            </div>
          </section>

          {/* WHY CHOOSE US */}
          <section className="grid sm:grid-cols-3 gap-8">
            <Feature icon={<TrendingUp />} title="Career-focused" desc="Skills employers actually want" />
            <Feature icon={<Clock />} title="Learn at your pace" desc="Anytime, anywhere" />
            <Feature icon={<Users />} title="Community" desc="Learn with others" />
          </section>
        </main>

        {/* MOBILE STICKY CTA */}
        <div className="fixed bottom-16 inset-x-0 sm:hidden z-40 px-4">
          <Link to="/signup">
            <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl">
              Start free trial · {activeTab}
            </button>
          </Link>
        </div>

        {/* DESKTOP CTA */}
        <div className="hidden sm:block fixed bottom-8 right-8 z-40">
          <Link to="/signup">
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              Start free trial <ArrowRight size={18} />
            </button>
          </Link>
        </div>

        {/* MOBILE NAV */}
        <nav className="fixed bottom-0 inset-x-0 bg-white border-t sm:hidden z-50">
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

const Feature = ({ icon, title, desc }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm">
    <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-bold mb-1">{title}</h3>
    <p className="text-slate-600 text-sm">{desc}</p>
  </div>
);

const CourseCard = ({ id }) => (
  <Link to={`/courses/${id}`} className="block">
    <div className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition">
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80"
          alt="course"
          className="w-full h-44 object-cover"
        />
        <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
          Bestseller
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold line-clamp-2">Advanced Python & Algorithms</h3>
        <p className="text-sm text-slate-500">Colt Steele</p>
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className="flex items-center gap-1 text-orange-600 font-bold">
            4.9 <Star size={14} />
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock size={14} /> 6h 30m
          </span>
        </div>
        <p className="mt-2 font-bold">$14.99</p>
      </div>
    </div>
  </Link>
);

const BottomNavItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex flex-col items-center text-xs ${active ? "text-blue-600 font-bold" : "text-slate-500"}`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Home;
