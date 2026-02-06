import React from "react";

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Course Image */}
      <div className="w-full h-40 bg-gray-800">
        <img
          src={course?.image || "https://via.placeholder.com/400x200?text=Course+Image"}
          alt={course?.title || "Course Image"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Course Details */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-lg font-bold text-white">{course?.title || "Course Title"}</h3>
        <p className="text-sm text-slate-400 line-clamp-2">{course?.description || "Course description goes here..."}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-500">Instructor: {course?.instructor || "Unknown"}</span>
          <span className="text-xs text-indigo-500 font-bold">{course?.category || "Category"}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
