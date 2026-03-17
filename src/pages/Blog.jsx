import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Layout from "../shared/Layout/Layout";

const posts = [
  { slug:"how-to-earn-97-percent", title:"How to Earn 97% Revenue as an Instructor on LMSPRO", excerpt:"Learn how to use your referral link and coupon codes to maximise your earnings on every sale.", category:"Instructors", date:"Mar 14, 2026", read:"5 min", img:"https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80" },
  { slug:"top-skills-2026",        title:"Top 10 In-Demand Skills to Learn in 2026",             excerpt:"From AI to no-code tools, here are the skills Nigerian professionals are paying to learn right now.", category:"Career",      date:"Mar 10, 2026", read:"7 min", img:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80" },
  { slug:"build-your-first-course",title:"A Step-by-Step Guide to Building Your First Online Course",excerpt:"From idea to published: everything you need to know about creating a course that students love.", category:"Instructors", date:"Mar 5, 2026",  read:"10 min",img:"https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80" },
  { slug:"paystack-integration",   title:"How LMSPRO Uses Paystack for Seamless Nigerian Payments",excerpt:"A behind-the-scenes look at our payment infrastructure and why we chose Paystack.", category:"Product",     date:"Feb 28, 2026", read:"4 min", img:"https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80" },
  { slug:"learning-consistency",   title:"The Science of Learning Consistency (and How to Build It)",excerpt:"Why showing up every day beats marathon study sessions, backed by research.", category:"Learning",    date:"Feb 20, 2026", read:"6 min", img:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80" },
  { slug:"lmspro-launch",          title:"Introducing LMSPRO: World-Class Learning, Built for Africa",excerpt:"Why we built LMSPRO, what makes it different, and what's coming next.", category:"Company",     date:"Feb 1, 2026",  read:"3 min", img:"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80" },
];

const categories = ["All","Company","Product","Instructors","Learning","Career"];

export default function Blog() {
  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 px-4 text-center">
          <span className="inline-block text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">Blog</span>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Stories, tips & insights</h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">From learning hacks to instructor guides — everything to help you grow on LMSPRO.</p>
        </div>

        {/* Category filter */}
        <div className="sticky top-16 bg-white/95 backdrop-blur z-10 border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button key={c} className="px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition">{c}</button>
            ))}
          </div>
        </div>

        {/* Posts grid */}
        <div className="max-w-5xl mx-auto px-4 py-16">
          {/* Featured */}
          <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 mb-10 hover:shadow-xl transition group">
            <div className="grid md:grid-cols-2">
              <img src={posts[0].img} alt={posts[0].title} className="h-64 md:h-full w-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="p-8 flex flex-col justify-center">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-4 w-fit">{posts[0].category}</span>
                <h2 className="text-2xl font-black text-slate-900 mb-3 leading-tight">{posts[0].title}</h2>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">{posts[0].excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Calendar size={11} />{posts[0].date}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{posts[0].read} read</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(1).map((post) => (
              <div key={post.slug} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition group">
                <img src={post.img} alt={post.title} className="w-full h-44 object-cover group-hover:scale-105 transition duration-500" />
                <div className="p-5">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full inline-block mb-3">{post.category}</span>
                  <h3 className="font-black text-slate-900 text-sm mb-2 leading-snug line-clamp-2">{post.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={10} />{post.date}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{post.read}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-400 text-sm mt-12">More posts coming soon. <a href="mailto:delightgeorge105@gmail.com" className="text-blue-600 font-semibold hover:underline">Submit a guest post →</a></p>
        </div>
      </div>
    </Layout>
  );
}
