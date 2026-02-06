// pages/Categories/Development.jsx
import React from "react";
import Layout from "../../shared/Layout/Layout";

import { CheckCircle } from "lucide-react";
import CourseCard from "../../Components/CourseCard";

const courses = [
  { title: "React for Beginners", instructor: "Jane Doe", rating: 4.8, reviews: "1.2k", price: 19.99, image: "https://images.unsplash.com/photo-1581090700227-6a72b1b5e6a1?auto=format&fit=crop&w=400&q=80" },
  { title: "Advanced Node.js", instructor: "John Smith", rating: 4.9, reviews: "2.3k", price: 24.99, image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80" },
  { title: "Next.js 15 Mastery", instructor: "Sarah Lee", rating: 4.8, reviews: "900", price: 29.99, image: "https://images.unsplash.com/photo-1581091215366-31c1efb37d3b?auto=format&fit=crop&w=400&q=80" },
];

const Development = () => (
  <Layout>
    <div className="flex flex-col min-h-screen bg-[#f8f9fb]">

      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 text-white py-20 lg:py-32 rounded-b-3xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-extrabold mb-6">
              Learn <span className="text-blue-400">Development</span> Skills
            </h1>
            <p className="text-xl mb-6 text-blue-100 max-w-md">
              Master web development, programming languages, and frameworks that the world’s top developers use.
            </p>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search Development courses..."
                className="flex-1 rounded-2xl py-3 px-4 text-slate-900 focus:outline-none"
              />
              <button className="bg-blue-500 hover:bg-blue-400 px-6 py-3 rounded-2xl font-bold transition-all">
                Explore
              </button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
              alt="Development Hero"
              className="rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><CheckCircle /></div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Verified Experts</p>
                <p className="text-slate-900 font-bold">800+ Instructors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Courses */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-slate-900 mb-10">Featured Development Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, idx) => (
            <CourseCard key={idx} {...course} />
          ))}
        </div>
      </section>

    </div>
  </Layout>
);

export default Development;
