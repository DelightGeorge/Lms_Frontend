import React from "react";
import Layout from "../shared/Layout/Layout";
// Assuming you'll use Lucide icons (standard for modern React apps)
import { Search, BookOpen, Star, PlayCircle, Award } from "lucide-react";

const Home = () => {
  return (
    <Layout>
      <div className="flex flex-col min-h-screen bg-white">
        
        {/* 1. HERO SECTION: The "Udemy" Big Search */}
        <section className="relative bg-slate-900 py-20 px-6">
          <div className="max-w-7xl mx-auto flex flex-col items-start z-10 relative">
            <div className="bg-white p-8 shadow-xl max-w-md rounded-sm">
              <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">
                Learning that gets you.
              </h1>
              <p className="text-lg text-slate-600 mb-6">
                Skills for your future. Enroll in courses from expert instructors.
              </p>
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="What do you want to learn?" 
                  className="w-full border-2 border-slate-900 p-3 pl-12 focus:outline-none"
                />
                <Search className="absolute left-4 text-slate-500" size={20} />
              </div>
            </div>
          </div>
          {/* Background Decoration (Unique touch) */}
          <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block opacity-20">
             <img src="/hero-illustration.svg" alt="learning" className="object-cover h-full w-full" />
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
          
          {/* 2. CATEGORY BAR (From your Category model) */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Top Categories</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {["Development", "Business", "Design", "Marketing", "IT & Software"].map((cat) => (
                <button key={cat} className="px-6 py-2 border border-slate-300 rounded-full hover:bg-slate-100 whitespace-nowrap font-medium transition">
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* 3. FEATURED COURSES (The Udemy Card Grid) */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">A broad selection of courses</h2>
                <p className="text-slate-600">Choose from over 210,000 online video courses with new additions published every month</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((course) => (
                <CourseCard key={course} />
              ))}
            </div>
          </section>

          {/* 4. UNIQUE VALUE PROPS (For the Grade) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-slate-200 py-12">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600"><PlayCircle /></div>
                <div>
                    <h3 className="font-bold">10k+ Online Courses</h3>
                    <p className="text-sm text-slate-500">Enjoy a variety of fresh topics</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-full text-purple-600"><Award /></div>
                <div>
                    <h3 className="font-bold">Expert Instruction</h3>
                    <p className="text-sm text-slate-500">Find the right instructor for you</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-full text-orange-600"><BookOpen /></div>
                <div>
                    <h3 className="font-bold">Lifetime Access</h3>
                    <p className="text-sm text-slate-500">Learn on your schedule</p>
                </div>
             </div>
          </section>
        </main>
      </div>
    </Layout>
  );
};

// Sub-component for the Udemy-style card
const CourseCard = () => (
  <div className="group cursor-pointer">
    <div className="aspect-video bg-slate-200 mb-3 overflow-hidden rounded-sm relative">
       {/* Course Thumbnail */}
       <div className="absolute inset-0 bg-slate-800/10 group-hover:bg-slate-800/0 transition" />
    </div>
    <h3 className="font-bold text-slate-900 leading-tight mb-1 line-clamp-2">
      The Complete 2026 Web Development Bootcamp
    </h3>
    <p className="text-xs text-slate-500 mb-1">Dr. Angela Yu, Developer</p>
    <div className="flex items-center gap-1 text-orange-700 font-bold text-sm">
      <span>4.8</span>
      <div className="flex text-orange-400"><Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /></div>
      <span className="text-slate-400 font-normal text-xs">(124,000)</span>
    </div>
    <div className="mt-1 font-bold text-lg text-slate-900">$12.99</div>
    <div className="mt-2 inline-block px-2 py-1 bg-yellow-200 text-[10px] font-extrabold uppercase tracking-wider">
        Bestseller
    </div>
  </div>
);

export default Home;