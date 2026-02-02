import React from "react";
import Layout from "../../shared/Layout/Layout";
import { PlayCircle, TrendingUp, Star, Users } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

const categories = [
  { name: "Development", icon: <PlayCircle size={20} />, link: "development", color: "bg-blue-100 text-blue-600" },
  { name: "Business", icon: <TrendingUp size={20} />, link: "business", color: "bg-emerald-100 text-emerald-600" },
  { name: "Design", icon: <Star size={20} />, link: "design", color: "bg-pink-100 text-pink-600" },
  { name: "Marketing", icon: <Users size={20} />, link: "marketing", color: "bg-purple-100 text-purple-600" },
];

const Categories = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-12 text-slate-900">Explore Categories</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.link} // nested route
              className="group bg-white border border-slate-100 p-8 rounded-2xl flex flex-col items-center gap-4 hover:shadow-xl transition-all"
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${cat.color} group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <h2 className="font-bold text-lg text-slate-900">{cat.name}</h2>
            </Link>
          ))}
        </div>

        {/* Nested category content will render here */}
        <Outlet />
      </div>
    </Layout>
  );
};

export default Categories;
