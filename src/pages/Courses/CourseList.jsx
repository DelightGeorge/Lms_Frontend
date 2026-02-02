import React from "react";
import { Link } from "react-router-dom";
import Layout from "../../shared/Layout/Layout";
import { Star } from "lucide-react";

const CourseList = () => {
  // Sample courses (replace later with backend data)
  const courses = [
    {
      id: 1,
      title: "Advanced Data Structures & Algorithms in Python 2026",
      instructor: "Colt Steele",
      rating: 4.9,
      reviews: "42k",
      price: 14.99,
      oldPrice: 84.99,
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 2,
      title: "UI/UX Design Masterclass",
      instructor: "Jane Doe",
      rating: 4.8,
      reviews: "21k",
      price: 19.99,
      oldPrice: 99.99,
      image:
        "https://images.unsplash.com/photo-1581090700227-9d3a575b5a52?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 3,
      title: "Fullstack Web Development Bootcamp",
      instructor: "John Smith",
      rating: 4.7,
      reviews: "35k",
      price: 29.99,
      oldPrice: 149.99,
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 4,
      title: "Mastering Excel for Business",
      instructor: "Emily Clark",
      rating: 4.6,
      reviews: "18k",
      price: 9.99,
      oldPrice: 49.99,
      image:
        "https://images.unsplash.com/photo-1519455953755-af066f52f1d7?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-slate-900 mb-10">All Courses</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group cursor-pointer"
            >
              <div className="aspect-[16/10] bg-slate-100 mb-4 overflow-hidden rounded-xl relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm">
                    Bestseller
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {course.title}
              </h3>
              <p className="text-sm text-slate-500 mb-2">{course.instructor}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-orange-600 font-black">{course.rating}</span>
                <div className="flex text-orange-400">
                  <Star size={14} fill="currentColor" />
                </div>
                <span className="text-slate-400 text-xs">({course.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-slate-900">${course.price}</span>
                <span className="text-slate-400 line-through text-sm">
                  ${course.oldPrice}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CourseList;
