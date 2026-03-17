import { useState } from "react";
import { Code, Copy, CheckCircle, Lock, Zap } from "lucide-react";
import Layout from "../shared/Layout/Layout";

const endpoints = [
  { method:"POST", path:"/api/auth/register",      tag:"Auth",     desc:"Register a new user",                     body:'{"fullName":"string","email":"string","password":"string","role":"STUDENT|INSTRUCTOR"}' },
  { method:"POST", path:"/api/auth/login",          tag:"Auth",     desc:"Log in and receive a JWT token",          body:'{"email":"string","password":"string"}' },
  { method:"GET",  path:"/api/courses",             tag:"Courses",  desc:"List all published courses",              params:"?search=&categoryId=&limit=&page=" },
  { method:"GET",  path:"/api/courses/:id",         tag:"Courses",  desc:"Get a single course with lessons",        auth:false },
  { method:"POST", path:"/api/payments/initialize", tag:"Payments", desc:"Initialize a Paystack payment",           body:'{"courseId":"string","couponCode":"string?","referral":"string?"}', auth:true },
  { method:"GET",  path:"/api/payments/verify/:ref",tag:"Payments", desc:"Verify a payment after callback",         auth:true },
  { method:"POST", path:"/api/payments/enroll/free",tag:"Payments", desc:"Enrol in a free course instantly",        body:'{"courseId":"string"}', auth:true },
  { method:"GET",  path:"/api/wallet/me",           tag:"Wallet",   desc:"Get instructor wallet and earnings",      auth:true },
  { method:"POST", path:"/api/wallet/payout/request",tag:"Wallet",  desc:"Request a payout",                       body:'{"amount":"number","payoutMethod":"bank_transfer|paypal","bankName":"string","accountNumber":"string","accountName":"string"}', auth:true },
  { method:"GET",  path:"/api/users/instructors",   tag:"Users",    desc:"List all instructors (public)",           params:"?search=&limit=" },
  { method:"GET",  path:"/api/users/instructors/:id",tag:"Users",   desc:"Get a public instructor profile",         auth:false },
  { method:"GET",  path:"/api/notifications",       tag:"Notifications",desc:"Get authenticated user notifications",auth:true },
];

const tags = ["All","Auth","Courses","Payments","Wallet","Users","Notifications"];
const methodColor = { GET:"bg-emerald-100 text-emerald-700", POST:"bg-blue-100 text-blue-700", PATCH:"bg-amber-100 text-amber-700", DELETE:"bg-red-100 text-red-700" };

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
      className="p-1.5 rounded-lg hover:bg-slate-700 transition text-slate-400 hover:text-white">
      {copied ? <CheckCircle size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
}

export default function ApiReference() {
  const [activeTag, setActiveTag] = useState("All");
  const [open, setOpen] = useState(null);
  const filtered = endpoints.filter((e) => activeTag === "All" || e.tag === activeTag);

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">API Reference</span>
            <h1 className="text-4xl font-black mb-3">LMSPRO REST API</h1>
            <p className="text-slate-300 mb-4">Base URL: <code className="bg-white/10 px-2 py-1 rounded-lg text-emerald-300 font-mono text-sm">https://lms-backend-4gx8.onrender.com</code></p>
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 border border-white/10 rounded-xl p-4 max-w-lg">
              <Lock size={14} className="text-amber-400 shrink-0" />
              <span>Protected endpoints require a <code className="text-amber-300 font-mono">Bearer &lt;token&gt;</code> header. Obtain a token via <code className="text-emerald-300 font-mono">POST /api/auth/login</code>.</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Tags */}
          <div className="flex gap-2 flex-wrap mb-8">
            {tags.map((t) => (
              <button key={t} onClick={() => setActiveTag(t)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${activeTag === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{t}</button>
            ))}
          </div>

          {/* Endpoints */}
          <div className="space-y-3">
            {filtered.map((ep) => {
              const key = ep.method + ep.path;
              const isOpen = open === key;
              return (
                <div key={key} className="border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition">
                  <button onClick={() => setOpen(isOpen ? null : key)} className="w-full flex items-center gap-3 p-4 text-left">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg shrink-0 ${methodColor[ep.method] || "bg-slate-100 text-slate-700"}`}>{ep.method}</span>
                    <code className="font-mono text-sm text-slate-800 flex-1">{ep.path}</code>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{ep.tag}</span>
                      {ep.auth && <Lock size={12} className="text-amber-500" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 p-5 space-y-4">
                      <p className="text-sm text-slate-600">{ep.desc}</p>
                      {ep.params && (
                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Query Params</p>
                          <div className="bg-slate-950 rounded-xl p-3 flex items-start justify-between gap-2">
                            <code className="text-emerald-400 font-mono text-xs">{ep.params}</code>
                            <CopyBtn text={ep.params} />
                          </div>
                        </div>
                      )}
                      {ep.body && (
                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Request Body (JSON)</p>
                          <div className="bg-slate-950 rounded-xl p-3 flex items-start justify-between gap-2">
                            <code className="text-blue-300 font-mono text-xs whitespace-pre-wrap break-all">{ep.body}</code>
                            <CopyBtn text={ep.body} />
                          </div>
                        </div>
                      )}
                      {ep.auth && (
                        <p className="text-xs text-amber-600 flex items-center gap-1.5"><Lock size={11} /> Requires <code className="font-mono bg-amber-50 px-1.5 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code> header</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 bg-slate-50 rounded-2xl border border-slate-100 p-6 text-sm text-slate-500">
            <Zap size={16} className="text-amber-500 mb-2" />
            <p>All responses are JSON. Successful responses use HTTP <code className="font-mono text-slate-700">2xx</code> status codes. Errors return <code className="font-mono text-slate-700">{"{ message: string }"}</code>. Need help? Email <a href="mailto:delightgeorge105@gmail.com" className="text-blue-600 font-semibold hover:underline">delightgeorge105@gmail.com</a>.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
