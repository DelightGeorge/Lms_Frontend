import { Link } from "react-router-dom";
import { Users, BarChart3, ShieldCheck, Zap, BookOpen, Award, CheckCircle, ArrowRight } from "lucide-react";
import Layout from "../shared/Layout/Layout";

export default function ForBusinesses() {
  const features = [
    { icon: Users,      title: "Team Learning",       desc: "Your employees can each enroll in any course individually and learn at their own pace, on any device." },
    { icon: BarChart3,  title: "Track Progress",      desc: "Every team member gets a personal dashboard showing their course progress, completed lessons, and certificates." },
    { icon: Award,      title: "Earn Certificates",   desc: "Employees receive a verified certificate upon completing each course — great for professional development records." },
    { icon: BookOpen,   title: "Huge Course Library",  desc: "Access hundreds of courses across Development, Design, Business, Marketing and more — all in one place." },
    { icon: ShieldCheck,title: "Verified Instructors", desc: "Every instructor on LMSPRO is vetted and approved. Your team learns only from qualified professionals." },
    { icon: Zap,        title: "Instant Access",      desc: "No contracts or lengthy onboarding. Buy a course, start learning immediately — it's that simple." },
  ];

  const steps = [
    { step: "01", title: "Browse the catalog",    desc: "Explore hundreds of courses across every skill category your team needs." },
    { step: "02", title: "Each member enrolls",   desc: "Team members purchase and enroll in the courses relevant to their role." },
    { step: "03", title: "Learn & get certified", desc: "Complete lessons, pass quizzes, and earn certificates of completion." },
  ];

  const useCases = [
    { role: "Developers",       courses: ["Full-Stack Web Development", "React & Node.js", "Python for Data Science"] },
    { role: "Designers",        courses: ["UI/UX Fundamentals", "Figma Mastery", "Brand Identity Design"] },
    { role: "Marketing Teams",  courses: ["Digital Marketing", "SEO & Content Strategy", "Social Media Growth"] },
    { role: "Business Leaders", courses: ["Project Management", "Financial Literacy", "Leadership & Communication"] },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-24 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative">
            <span className="inline-block text-xs font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">For Businesses</span>
            <h1 className="text-4xl sm:text-5xl font-black mb-5 leading-tight">
              Upskill your team.<br />
              <span className="text-indigo-400">One course at a time.</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
              No subscriptions. No contracts. Your employees simply browse our course library, enroll in what they need, and start learning today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/courses" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-4 rounded-xl transition shadow-lg shadow-indigo-600/30">
                Browse Courses <ArrowRight size={16} />
              </Link>
              <a href="mailto:delightgeorge105@gmail.com" className="inline-flex items-center gap-2 border-2 border-white/20 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-xl transition">
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Simple by design</span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">How it works for teams</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/20">
                  <span className="text-white font-black text-lg">{step}</span>
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-slate-50 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Why LMSPRO</span>
              <h2 className="text-3xl font-black text-slate-900 mt-2">Everything your team needs to grow</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={22} className="text-indigo-600" />
                  </div>
                  <h3 className="font-black text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Popular with teams</span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">Courses for every role</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">Whatever your team's skill gap, there's a course for it. Here are some popular picks by role.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map(({ role, courses }) => (
              <div key={role} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-wide">{role}</h3>
                <ul className="space-y-2.5">
                  {courses.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/courses" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-black px-8 py-4 rounded-xl transition text-sm">
              View All Courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 py-16 px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-black mb-3">Ready to invest in your team?</h2>
            <p className="text-indigo-200 mb-8 text-sm">Browse our full course library and have your team enrolled and learning today — no setup needed.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/courses" className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-black px-8 py-4 rounded-xl transition text-sm">
                Browse Courses <ArrowRight size={16} />
              </Link>
              <a href="mailto:delightgeorge105@gmail.com" className="inline-flex items-center gap-2 border-2 border-white/30 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-xl transition text-sm">
                Get in Touch
              </a>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}