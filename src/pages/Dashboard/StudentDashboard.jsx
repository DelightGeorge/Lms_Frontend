import React from "react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <h1 className="text-3xl font-black mb-8">My Learning</h1>

      <Link
        to="/learn/1/1"
        className="block bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-lg transition-all"
      >
        <h3 className="font-bold text-lg">Advanced Python</h3>
        <p className="text-slate-500 text-sm">Continue Lesson 1</p>
      </Link>
    </div>
  );
};

export default StudentDashboard;
