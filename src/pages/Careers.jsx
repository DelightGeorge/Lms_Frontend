import { Link } from "react-router-dom";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import Layout from "../shared/Layout/Layout";

export default function Careers() {
  const openRoles = [
    { title: "Frontend Engineer",        dept: "Engineering",  type: "Full-time", location: "Remote (Nigeria)" },
    { title: "Backend Engineer",         dept: "Engineering",  type: "Full-time", location: "Remote (Nigeria)" },
    { title: "Product Designer (UI/UX)", dept: "Design",       type: "Full-time", location: "Remote"           },
    { title: "Content Partnerships Lead",dept: "Growth",       type: "Full-time", location: "Lagos, Nigeria"   },
    { title: "Community Manager",        dept: "Growth",       type: "Part-time", location: "Remote"           },
    { title: "Curriculum Reviewer",      dept: "Content",      type: "Contract",  location: "Remote"           },
  ];

  const perks = [
    "100% remote-friendly",
    "Competitive salary in USD",
    "Free access to all LMSPRO courses",
    "Flexible working hours",
    "Annual learning & development budget",
    "Health insurance contribution",
    "Work with a mission-driven team",
    "Regular team retreats",
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl mx-auto relative">
            <span className="inline-block text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">Careers</span>
            <h1 className="text-4xl sm:text-5xl font-black mb-5">Help us build the future<br /><span className="text-emerald-400">of African education.</span></h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">We're a small, passionate team on a big mission. Join us and do the most meaningful work of your career.</p>
          </div>
        </div>

        {/* Perks */}
        <div className="max-w-4xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Why work at LMSPRO?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {perks.map((perk) => (
              <div key={perk} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                <p className="text-sm font-bold text-emerald-800 leading-snug">{perk}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open Roles */}
        <div className="bg-slate-50 py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Open Positions</h2>
            <div className="space-y-4">
              {openRoles.map((role) => (
                <div key={role.title} className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center justify-between gap-4 hover:shadow-md transition group">
                  <div>
                    <h3 className="font-black text-slate-900 mb-1">{role.title}</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">{role.dept}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={11} />{role.type}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><MapPin size={11} />{role.location}</span>
                    </div>
                  </div>
                  <a href="mailto:delightgeorge105@gmail.com?subject=Application: " className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 shrink-0 group-hover:gap-2.5 transition-all">
                    Apply <ArrowRight size={15} />
                  </a>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-500 text-sm mt-8">Don't see your role? Send us a general application at <a href="mailto:delightgeorge105@gmail.com" className="text-blue-600 font-semibold hover:underline">delightgeorge105@gmail.com</a></p>
          </div>
        </div>

        {/* Values CTA */}
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-4">Our hiring process</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[["01","Apply","Send your CV and a short note about why you want to join"],["02","Interview","1–2 conversations with the team to get to know each other"],["03","Offer","If it's a match, we move fast and get you onboarded quickly"]].map(([n,t,d])=>(
              <div key={t} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left">
                <p className="text-2xl font-black text-blue-600 mb-2">{n}</p>
                <p className="font-black text-slate-900 mb-1">{t}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
