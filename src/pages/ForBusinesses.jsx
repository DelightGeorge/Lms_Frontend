import { Link } from "react-router-dom";
import { Users, BarChart3, ShieldCheck, Zap, BookOpen, Award, CheckCircle } from "lucide-react";
import Layout from "../shared/Layout/Layout";

export default function ForBusinesses() {
  const features = [
    { icon: Users,      title: "Team Enrollment",     desc: "Enroll your entire team in any course with a single purchase and track individual progress." },
    { icon: BarChart3,  title: "Progress Analytics",  desc: "Monitor completion rates, quiz scores, and learning time across your organization." },
    { icon: ShieldCheck,title: "Dedicated Support",   desc: "Priority support and a dedicated account manager for enterprise customers." },
    { icon: Award,      title: "Bulk Certificates",   desc: "Issue certificates of completion to your employees to track professional development." },
    { icon: BookOpen,   title: "Custom Courses",      desc: "Work with our instructors to create bespoke training content for your industry." },
    { icon: Zap,        title: "Fast Onboarding",     desc: "Get your team up and running in under 24 hours with our simple onboarding process." },
  ];

  const plans = [
    { name: "Starter",    price: "$199",  per: "/month", seats: "Up to 10 seats",  features: ["Access to all courses","Progress tracking","Team dashboard","Email support"] },
    { name: "Growth",     price: "$499",  per: "/month", seats: "Up to 50 seats",  features: ["Everything in Starter","Analytics reports","Bulk certificates","Priority support"], popular: true },
    { name: "Enterprise", price: "Custom",per: "",       seats: "Unlimited seats", features: ["Everything in Growth","Custom courses","Dedicated manager","SLA guarantee"] },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-24 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative">
            <span className="inline-block text-xs font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">For Businesses</span>
            <h1 className="text-4xl sm:text-5xl font-black mb-5 leading-tight">Upskill your team.<br /><span className="text-indigo-400">Grow your business.</span></h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">Give your employees access to world-class courses, track their progress, and build a culture of continuous learning.</p>
            <a href="mailto:delightgeorge105@gmail.com" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-4 rounded-xl transition shadow-lg shadow-indigo-600/30">
              Contact Sales
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-14">Built for growing teams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4"><Icon size={22} className="text-indigo-600" /></div>
                <h3 className="font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="bg-slate-50 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 text-center mb-14">Business Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.name} className={`bg-white rounded-2xl p-8 border-2 ${plan.popular ? "border-indigo-500 shadow-xl shadow-indigo-100" : "border-slate-100"} relative`}>
                  {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-black px-4 py-1 rounded-full">Most Popular</span>}
                  <h3 className="font-black text-slate-900 text-xl mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">{plan.seats}</p>
                  <div className="mb-6"><span className="text-4xl font-black text-slate-900">{plan.price}</span><span className="text-slate-400 text-sm">{plan.per}</span></div>
                  <ul className="space-y-2.5 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle size={14} className="text-emerald-500 shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <a href="mailto:delightgeorge105@gmail.com" className={`block text-center py-3 rounded-xl font-bold text-sm transition ${plan.popular ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "border border-slate-200 hover:bg-slate-50 text-slate-700"}`}>
                    {plan.price === "Custom" ? "Contact Us" : "Get Started"}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
