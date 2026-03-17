import { Link } from "react-router-dom";
import { Users, BookOpen, Award, Globe, Heart, Zap } from "lucide-react";
import Layout from "../shared/Layout/Layout";

export default function AboutUs() {
  const values = [
    { icon: Heart,   title: "Student First",      desc: "Every decision we make starts with the question: does this help our learners succeed?" },
    { icon: Globe,   title: "Built for Africa",   desc: "We're proudly Nigerian, building world-class learning infrastructure for African professionals." },
    { icon: Zap,     title: "Practical Learning", desc: "We focus on skills you can apply immediately — not theory for its own sake." },
    { icon: Award,   title: "Instructor Success", desc: "When our instructors thrive financially, they create better content. We align our incentives accordingly." },
    { icon: BookOpen,title: "Open Knowledge",     desc: "We believe great education should be accessible to everyone regardless of background." },
    { icon: Users,   title: "Community",          desc: "Learning is better together. We foster a culture of peer support and collaboration." },
  ];

  const team = [
    { name: "Delight George", role: "Founder & CEO",          initials: "DG", color: "from-blue-500 to-indigo-600"   },
    { name: "Product Team",   role: "Product & Engineering",   initials: "PT", color: "from-emerald-500 to-teal-600"  },
    { name: "Content Team",   role: "Curriculum & Quality",    initials: "CT", color: "from-amber-500 to-orange-600"  },
    { name: "Growth Team",    role: "Marketing & Community",   initials: "GT", color: "from-violet-500 to-purple-600" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl mx-auto relative">
            <span className="inline-block text-xs font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">About Us</span>
            <h1 className="text-4xl sm:text-5xl font-black mb-5 leading-tight">We're on a mission to make<br /><span className="text-blue-400">world-class education accessible.</span></h1>
            <p className="text-slate-300 text-lg leading-relaxed">LMSPRO was built in Nigeria, for the world. We connect ambitious learners with expert instructors and give everyone the tools to grow professionally.</p>
          </div>
        </div>

        {/* Story */}
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Our Story</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            LMSPRO started with a simple frustration: world-class online courses existed, but African professionals were being left behind — high prices, payment barriers, and content that didn't reflect our context.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            We built LMSPRO to fix that. A platform where Nigerian and African instructors can monetise their expertise at fair revenue splits, and where learners can access quality education at prices that make sense locally.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed">
            Today, we're growing — more courses, more instructors, more learners. But the mission stays the same: skills that pay, knowledge that lasts.
          </p>
        </div>

        {/* Stats */}
        <div className="bg-blue-600 py-16 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            {[["100+","Courses"],["500+","Learners"],["20+","Instructors"],["10+","Categories"]].map(([val, label]) => (
              <div key={label}>
                <p className="text-4xl font-black mb-1">{val}</p>
                <p className="text-blue-200 text-sm font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-14">What we believe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-4"><Icon size={20} className="text-blue-600" /></div>
                <h3 className="font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="bg-slate-50 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 text-center mb-14">The team behind LMSPRO</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map(({ name, role, initials, color }) => (
                <div key={name} className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-sm hover:shadow-md transition">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center font-black text-xl mx-auto mb-4`}>{initials}</div>
                  <p className="font-black text-slate-900 text-sm">{name}</p>
                  <p className="text-xs text-slate-400 mt-1">{role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Ready to join us?</h2>
          <p className="text-slate-500 mb-8">Whether you want to learn or teach, there's a place for you on LMSPRO.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-xl transition">Browse Courses</Link>
            <Link to="/become-instructor" className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-8 py-4 rounded-xl transition">Become an Instructor</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
