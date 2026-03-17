import { Download, Mail, ExternalLink } from "lucide-react";
import Layout from "../shared/Layout/Layout";

export default function Press() {
  const facts = [
    ["Founded","2025"],["Headquarters","Nigeria 🇳🇬"],["Courses","100+"],
    ["Learners","500+"],["Instructors","20+"],["Revenue model","Pay-per-course"],
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 px-4 text-center">
          <span className="inline-block text-xs font-bold text-slate-300 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">Press Kit</span>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Media & Press</h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">Everything journalists and media partners need to cover LMSPRO.</p>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-20 space-y-14">

          {/* About blurb */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">About LMSPRO</h2>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <p className="text-slate-600 leading-relaxed mb-4"><strong>Short version (1 sentence):</strong> LMSPRO is a Nigerian online learning platform where expert instructors earn up to 97% revenue sharing and learners access premium courses at locally-relevant prices.</p>
              <p className="text-slate-600 leading-relaxed"><strong>Long version:</strong> LMSPRO is a full-stack learning management platform built for African professionals. Founded in Nigeria, LMSPRO enables instructors to create and sell courses with industry-leading revenue splits — up to 97% for referral-sourced sales — while giving learners access to practical, job-ready skills in technology, business, design, and more. The platform supports Paystack payments, certificates of completion, quizzes, lesson comments, and a dedicated instructor wallet for real-time earnings tracking.</p>
            </div>
          </div>

          {/* Fast facts */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Fast Facts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {facts.map(([label, val]) => (
                <div key={label} className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="font-black text-slate-900 text-lg">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Logo */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Brand Assets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-lg shadow-blue-200">L</div>
                <p className="text-sm font-bold text-slate-700">Logo (Light Background)</p>
                <button className="flex items-center gap-2 text-sm text-blue-600 font-bold hover:underline"><Download size={14} /> Download PNG</button>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-lg shadow-blue-900">L</div>
                <p className="text-sm font-bold text-slate-300">Logo (Dark Background)</p>
                <button className="flex items-center gap-2 text-sm text-blue-400 font-bold hover:underline"><Download size={14} /> Download PNG</button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Brand colour: <span className="font-bold text-slate-600">#2563EB</span> · Font: Inter Black</p>
          </div>

          {/* Contact */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-black text-slate-900 mb-2">Press Enquiries</h2>
            <p className="text-slate-600 text-sm mb-5">For interviews, media partnerships, or coverage requests, reach out directly.</p>
            <a href="mailto:delightgeorge105@gmail.com?subject=Press Enquiry"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm">
              <Mail size={15} /> delightgeorge105@gmail.com
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
