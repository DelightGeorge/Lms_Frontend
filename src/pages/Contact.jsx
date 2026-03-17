import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle, Clock, Users } from "lucide-react";
import Layout from "../shared/Layout/Layout";

export default function Contact() {
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [sent, setSent] = useState(false);
  const set = (k,v) => setForm((p) => ({ ...p, [k]:v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailto = `mailto:delightgeorge105@gmail.com?subject=${encodeURIComponent(form.subject || "Contact from LMSPRO")}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.location.href = mailto;
    setSent(true);
  };

  const topics = [
    { icon: MessageCircle, label:"General Enquiry",    email:"delightgeorge105@gmail.com"                           },
    { icon: Users,         label:"Instructor Support", email:"delightgeorge105@gmail.com?subject=Instructor Support" },
    { icon: Clock,         label:"Technical Support",  email:"delightgeorge105@gmail.com?subject=Technical Support"  },
    { icon: Mail,          label:"Press & Partnerships",email:"delightgeorge105@gmail.com?subject=Press Enquiry"     },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-20 px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Get in Touch</h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">Have a question, idea, or issue? We'd love to hear from you. We typically respond within 1 business day.</p>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Form */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-6">Send us a message</h2>
            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
                <h3 className="font-black text-slate-900 mb-2">Message opened!</h3>
                <p className="text-slate-600 text-sm">Your email client should have opened. If not, email us directly at <a href="mailto:delightgeorge105@gmail.com" className="text-blue-600 font-semibold hover:underline">delightgeorge105@gmail.com</a>.</p>
                <button onClick={() => setSent(false)} className="mt-4 text-sm text-blue-600 font-bold hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Name *</label>
                    <input value={form.name} onChange={(e)=>set("name",e.target.value)} required placeholder="John Doe"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address *</label>
                    <input type="email" value={form.email} onChange={(e)=>set("email",e.target.value)} required placeholder="you@example.com"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Subject *</label>
                  <input value={form.subject} onChange={(e)=>set("subject",e.target.value)} required placeholder="How can we help?"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Message *</label>
                  <textarea value={form.message} onChange={(e)=>set("message",e.target.value)} required rows={5} placeholder="Tell us more..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-sm">
                  <Send size={15} /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-6">Contact Information</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail,   label:"Email",    value:"delightgeorge105@gmail.com", href:"mailto:delightgeorge105@gmail.com" },
                  { icon: Phone,  label:"Phone",    value:"+234 706 410 2781",          href:"tel:+2347064102781" },
                  { icon: MapPin, label:"Location", value:"Nigeria 🇳🇬",                 href:null },
                  { icon: Clock,  label:"Response", value:"Within 1 business day",      href:null },
                ].map(({ icon:Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"><Icon size={18} className="text-blue-600" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                      {href ? <a href={href} className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition">{value}</a>
                             : <p className="text-sm font-semibold text-slate-800">{value}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-black text-slate-900 mb-4">Contact by Topic</h3>
              <div className="space-y-2">
                {topics.map(({ icon:Icon, label, email }) => (
                  <a key={label} href={`mailto:${email}`}
                    className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition group">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-blue-300 group-hover:bg-blue-50 transition">
                      <Icon size={14} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition">{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
