import React, { useState, useEffect } from "react";
import Layout from "../../shared/Layout/Layout";
import { BookOpen, Sparkles, TrendingUp, Users, ArrowRight, Zap } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { getAllCategories } from "../../services/courseService";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCategories()
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : [];
        setCategories(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categoryIcons = {
    development: <BookOpen size={24} />,
    business: <TrendingUp size={24} />,
    design: <Sparkles size={24} />,
    marketing: <Users size={24} />,
    default: <Zap size={24} />,
  };

  const categoryColors = [
    "from-blue-600 to-blue-700",
    "from-emerald-600 to-teal-700",
    "from-amber-600 to-orange-700",
    "from-violet-600 to-purple-700",
    "from-rose-600 to-pink-700",
    "from-cyan-600 to-blue-700",
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white px-4 py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto relative">
            <div className="space-y-4 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30">
                <Sparkles size={16} className="text-amber-300" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Explore Learning</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight">
                Discover Your Next
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300">
                  Skill Path
                </span>
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                Browse hundreds of premium courses organized by topic. Find exactly what you need to level up your skills.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
          {/* Categories Grid */}
          <section>
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 mb-3">Popular Categories</h2>
              <p className="text-slate-600">Choose a category to explore relevant courses</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, idx) => {
                  const gradient = categoryColors[idx % categoryColors.length];
                  const name = cat.name?.toLowerCase() || "category";
                  const icon = categoryIcons[name] || categoryIcons.default;

                  return (
                    <Link
                      key={cat.id}
                      to={name}
                      className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Background gradient */}
                      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-full blur-3xl`} />

                      <div className="relative space-y-4">
                        {/* Icon */}
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          {icon}
                        </div>

                        {/* Content */}
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 group-hover:text-slate-950 mb-2">
                            {cat.name}
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            Master {cat.name?.toLowerCase()} skills with our curated courses from industry experts.
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Browse Courses
                          </span>
                          <ArrowRight
                            size={18}
                            className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all duration-300"
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Stats Section */}
          <section className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-3xl p-12 text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
            </div>

            <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {[
                { number: "500+", label: "Premium Courses" },
                { number: "2M+", label: "Active Learners" },
                { number: "800+", label: "Expert Instructors" },
                { number: "95%", label: "Completion Rate" },
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-3xl sm:text-4xl font-black text-amber-300">{stat.number}</p>
                  <p className="text-sm text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Nested content (category details) */}
        <Outlet />
      </div>
    </Layout>
  );
};

export default Categories;
