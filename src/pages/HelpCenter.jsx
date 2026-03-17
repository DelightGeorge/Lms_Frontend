import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown, ChevronUp, BookOpen, DollarSign, Users, Award, Settings, MessageCircle } from "lucide-react";
import Layout from "../shared/Layout/Layout";

const faqs = [
  { cat:"Getting Started", q:"How do I create an account?",             a:"Click 'Sign Up' on the homepage, enter your name, email, and password. You'll receive a verification email — click the link to activate your account." },
  { cat:"Getting Started", q:"Is LMSPRO free to use?",                  a:"Creating an account is free. Many courses are also free. Paid courses have a one-time fee — no subscription required." },
  { cat:"Getting Started", q:"What devices can I use?",                 a:"LMSPRO works on any device with a browser — desktop, tablet, and mobile. A native app is coming soon." },
  { cat:"Courses",         q:"How do I enrol in a course?",             a:"Go to the course page and click 'Enrol Now'. Free courses are instant. Paid courses go through our secure Paystack checkout." },
  { cat:"Courses",         q:"Can I access a course after buying?",     a:"Yes — lifetime access. Once you purchase a course, it's yours forever including any future updates the instructor adds." },
  { cat:"Courses",         q:"How do I earn a certificate?",            a:"Complete all lessons in a course to unlock your certificate of completion. Download or share it directly from your dashboard." },
  { cat:"Payments",        q:"What payment methods are accepted?",      a:"We accept all major cards via Paystack including Visa, Mastercard, and Verve. Bank transfers are also supported." },
  { cat:"Payments",        q:"Can I get a refund?",                     a:"Refunds are considered within 30 days of purchase if you haven't completed more than 20% of the course. Contact support with your order details." },
  { cat:"Instructors",     q:"How do I become an instructor?",          a:"Click 'Become an Instructor' and submit your application. Our team reviews it within 2–3 business days." },
  { cat:"Instructors",     q:"How do instructor payouts work?",         a:"Earnings are held for 30 days after each sale, then released to your available balance. Request a payout once you have $25+ via bank transfer or PayPal." },
  { cat:"Account",         q:"How do I reset my password?",             a:"Click 'Forgot Password' on the login page and enter your email. You'll receive a reset link within a few minutes." },
  { cat:"Account",         q:"Can I change my email address?",          a:"Yes — go to Settings in your profile and update your email. You'll need to verify the new address." },
];

const categories = [
  { label:"Getting Started", icon: BookOpen  },
  { label:"Courses",         icon: Award     },
  { label:"Payments",        icon: DollarSign},
  { label:"Instructors",     icon: Users     },
  { label:"Account",         icon: Settings  },
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden hover:border-blue-200 transition">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="font-bold text-slate-900 text-sm pr-4">{q}</span>
        {open ? <ChevronUp size={16} className="text-blue-500 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
      </button>
      {open && <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4">{a}</div>}
    </div>
  );
}

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Getting Started");

  const filtered = faqs.filter((f) =>
    f.cat === activeCat && (
      !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4 text-center">
          <h1 className="text-4xl font-black mb-4">How can we help you?</h1>
          <p className="text-blue-100 mb-8">Search our help docs or browse by topic below</p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search help articles..."
              className="w-full bg-white text-slate-900 rounded-xl py-4 pl-12 pr-4 outline-none text-sm shadow-xl" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-56 shrink-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Topics</p>
            <div className="space-y-1">
              {categories.map(({ label, icon: Icon }) => (
                <button key={label} onClick={() => setActiveCat(label)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition ${activeCat === label ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="flex-1">
            <h2 className="text-xl font-black text-slate-900 mb-5">{activeCat}</h2>
            {filtered.length === 0 ? (
              <p className="text-slate-400 py-8 text-center">No articles match your search.</p>
            ) : (
              <div className="space-y-3">
                {filtered.map((f) => <FAQ key={f.q} q={f.q} a={f.a} />)}
              </div>
            )}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-slate-50 py-14 px-4 text-center border-t border-slate-100">
          <MessageCircle size={36} className="text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 mb-2">Still need help?</h3>
          <p className="text-slate-500 text-sm mb-5">Our support team is ready to help you via email.</p>
          <a href="mailto:delightgeorge105@gmail.com" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm">
            Contact Support
          </a>
        </div>
      </div>
    </Layout>
  );
}
