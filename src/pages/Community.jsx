import { Link } from "react-router-dom";
import { MessageCircle, Users, Star, Zap, ArrowRight, BookOpen } from "lucide-react";
import Layout from "../shared/Layout/Layout";

export default function Community() {
  const channels = [
    { icon: MessageCircle, name: "General Discussion",  desc: "Introduce yourself, share wins, and connect with fellow learners.",      members: "340+" },
    { icon: BookOpen,      name: "Course Q&A",          desc: "Ask questions about specific courses and get answers from peers.",         members: "210+" },
    { icon: Zap,           name: "Tech & Engineering",  desc: "Discuss programming, tools, and tech career advice.",                      members: "180+" },
    { icon: Star,          name: "Instructor Lounge",   desc: "A space for instructors to share tips, course ideas and feedback.",        members: "60+"  },
    { icon: Users,         name: "Accountability Groups",desc: "Find an accountability buddy and commit to your learning goals.",        members: "90+"  },
    { icon: ArrowRight,    name: "Job Board",           desc: "Post and find job opportunities shared by our instructor and learner community.", members: "120+" },
  ];

  const guidelines = [
    "Be respectful and kind to all members",
    "No spam, self-promotion without context, or off-topic posts",
    "Share knowledge generously — questions are always welcome",
    "Give constructive feedback, not criticism",
    "Report harmful content to the moderators",
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">
        {/* Hero */}
        <div className="bg-gradient-to-br from-violet-900 via-purple-950 to-slate-900 text-white py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl mx-auto relative">
            <span className="inline-block text-xs font-bold text-violet-300 bg-violet-500/20 border border-violet-400/30 px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">Community</span>
            <h1 className="text-4xl sm:text-5xl font-black mb-5">Learn better, together.</h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">Join thousands of learners and instructors who support each other, share knowledge, and celebrate wins every day.</p>
            <a href="mailto:delightgeorge105@gmail.com?subject=Join Community" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl transition shadow-lg shadow-violet-600/30">
              <Users size={18} /> Join the Community
            </a>
          </div>
        </div>

        {/* Channels */}
        <div className="max-w-5xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-14">Community Spaces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {channels.map(({ icon: Icon, name, desc, members }) => (
              <div key={name} className="bg-slate-50 rounded-2xl border border-slate-100 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center"><Icon size={20} className="text-violet-600" /></div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{members} members</span>
                </div>
                <h3 className="font-black text-slate-900 mb-2">{name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-violet-50 py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Community Guidelines</h2>
            <ul className="space-y-3 text-left">
              {guidelines.map((g) => (
                <li key={g} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-violet-100 text-sm text-slate-700">
                  <span className="w-5 h-5 bg-violet-600 rounded-full text-white text-[10px] flex items-center justify-center font-black shrink-0 mt-0.5">✓</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Upcoming events */}
        <div className="max-w-4xl mx-auto px-4 py-20">
          <h2 className="text-2xl font-black text-slate-900 text-center mb-10">Upcoming Events</h2>
          <div className="space-y-4">
            {[
              { date:"Mar 25, 2026", title:"Live Q&A: How to Land a Tech Job in Nigeria",       host:"Delight George",     type:"Webinar"  },
              { date:"Apr 2, 2026",  title:"Instructor Masterclass: Creating Videos that Convert",host:"LMSPRO Team",       type:"Workshop" },
              { date:"Apr 10, 2026", title:"Community Study Sprint: 7-day JavaScript Challenge", host:"Community Members",  type:"Challenge"},
            ].map(({ date, title, host, type }) => (
              <div key={title} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-5 hover:shadow-md transition">
                <div className="bg-violet-50 rounded-xl p-3 text-center min-w-[64px] border border-violet-100">
                  <p className="text-xs font-bold text-violet-600">{date.split(" ")[0]}</p>
                  <p className="text-xl font-black text-violet-800">{date.split(" ")[1].replace(",","")}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 text-sm mb-1 line-clamp-1">{title}</h3>
                  <p className="text-xs text-slate-400">Hosted by {host} · <span className="text-violet-600 font-semibold">{type}</span></p>
                </div>
                <a href="mailto:delightgeorge105@gmail.com?subject=Event RSVP" className="text-sm font-bold text-violet-600 hover:underline shrink-0">RSVP →</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
