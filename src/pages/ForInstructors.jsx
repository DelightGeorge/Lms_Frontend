import { Link } from "react-router-dom";
import { CheckCircle, DollarSign, Users, BookOpen, TrendingUp, Star, Zap, Award } from "lucide-react";
import Layout from "../shared/Layout/Layout";

export default function ForInstructors() {
  const perks = [
    { icon: DollarSign, title: "Earn up to 97%",        desc: "Keep 97% of revenue when students come through your referral link or coupon. 37% for platform-sourced sales." },
    { icon: Users,      title: "Global Reach",           desc: "Reach thousands of learners across Nigeria and beyond without any marketing spend." },
    { icon: TrendingUp, title: "Real-time Analytics",    desc: "Track enrollments, revenue, ratings, and student progress from your instructor dashboard." },
    { icon: Award,      title: "Build Your Brand",       desc: "Get a public instructor profile, referral links, and coupon codes to grow your audience." },
    { icon: Star,       title: "Student Reviews",        desc: "Earn credibility through verified student reviews and course ratings." },
    { icon: Zap,        title: "Instant Payouts",        desc: "Request payouts directly to your bank account or PayPal once your balance clears." },
  ];

  const steps = [
    { step: "01", title: "Apply",    desc: "Submit your instructor application with your background, expertise, and a sample video." },
    { step: "02", title: "Get Approved", desc: "Our team reviews your application within 2–3 business days and notifies you by email." },
    { step: "03", title: "Create",   desc: "Build your course with video lessons, text content, quizzes, and downloadable resources." },
    { step: "04", title: "Earn",     desc: "Once published, start earning from every enrollment. Withdraw anytime you hit $25." },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-24 px-4 relative overflow-hidden">
          <div className="absolute -top-20 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative">
            <span className="inline-block text-xs font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">For Instructors</span>
            <h1 className="text-4xl sm:text-5xl font-black mb-5 leading-tight">Share your knowledge.<br /><span className="text-blue-400">Earn what you deserve.</span></h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">Join LMSPRO as an instructor and turn your expertise into income. Set your own schedule, keep most of your revenue, and reach learners worldwide.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/become-instructor" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition shadow-lg shadow-blue-600/30">
                <Zap size={18} /> Apply to Teach
              </Link>
              <Link to="/instructors" className="inline-flex items-center gap-2 border border-white/20 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-xl transition">
                Meet Our Instructors
              </Link>
            </div>
          </div>
        </div>

        {/* Perks */}
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Why teach on LMSPRO?</h2>
            <p className="text-slate-500">Everything you need to build a successful teaching business</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-blue-600" />
                </div>
                <h3 className="font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue split */}
        <div className="bg-slate-50 py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-12">How revenue sharing works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-8">
                <p className="text-5xl font-black text-violet-700 mb-2">97%</p>
                <p className="font-black text-violet-800 mb-2">Your Referral Sales</p>
                <p className="text-sm text-violet-600">When a student uses your coupon code or referral link</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
                <p className="text-5xl font-black text-blue-700 mb-2">37%</p>
                <p className="font-black text-blue-800 mb-2">Platform Sales</p>
                <p className="text-sm text-blue-600">When a student discovers your course via search or browse</p>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-14">How to get started</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg mx-auto mb-4 shadow-lg shadow-blue-200">{step}</div>
                <h3 className="font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/become-instructor" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-4 rounded-xl transition shadow-lg shadow-blue-200">
              Start Your Application
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}