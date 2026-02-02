import React from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../../shared/Layout/Layout";
import { Star, ArrowLeft } from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams(); // get course ID from URL

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* BACK BUTTON */}
        <Link
          to="/courses"
          className="flex items-center gap-2 text-blue-600 font-bold hover:underline mb-6"
        >
          <ArrowLeft size={18} /> Back to Courses
        </Link>

        {/* COURSE HEADER */}
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-shrink-0 lg:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
              alt="Course"
              className="rounded-2xl shadow-xl w-full"
            />
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <h1 className="text-4xl font-bold text-slate-900">
              Advanced Data Structures & Algorithms in Python 2026
            </h1>

            <div className="flex items-center gap-4">
              <span className="text-orange-600 font-bold">4.9</span>
              <Star size={16} className="text-orange-400" />
              <span className="text-slate-400">(42k reviews)</span>
            </div>

            <p className="text-slate-600">
              Taught by <strong>Colt Steele</strong>, Developer. Master advanced
              Python topics and algorithms to supercharge your career in tech.
            </p>

            {/* PRICE & ENROLL */}
            <div className="flex items-center gap-6 mt-4">
              <span className="text-2xl font-bold text-slate-900">$14.99</span>
              <span className="text-slate-400 line-through">$84.99</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* CONNECTED BUTTON */}
              <Link
                to="/auth"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all text-center"
              >
                Enroll Now
              </Link>
              <Link
                to="/courses"
                className="px-8 py-4 border border-slate-300 hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-center"
              >
                Browse Other Courses
              </Link>
            </div>
          </div>
        </div>

        {/* COURSE DESCRIPTION */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Course Description</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            This course dives deep into Python data structures and algorithms, covering linked lists,
            trees, graphs, sorting, searching, and more. Perfect for aspiring software engineers
            looking to sharpen their skills.
          </p>
          <p className="text-slate-600 leading-relaxed">
            By the end of this course, you'll have practical experience with complex algorithms
            and be able to implement them efficiently in real-world projects.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetail;
