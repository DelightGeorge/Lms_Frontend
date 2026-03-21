import { Link } from "react-router-dom";
import { CheckCircle, X } from "lucide-react";
import Layout from "../shared/Layout/Layout";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "₦0",
      desc: "Start learning at no cost",
      color: "border-slate-200",
      btn: "bg-slate-900 text-white hover:bg-slate-800",
      cta: "Get Started",
      to: "/auth",
      features: [
        { text: "Access to free courses",   ok: true  },
        { text: "Course previews",           ok: true  },
        { text: "Community discussions",     ok: true  },
        { text: "Paid courses",              ok: false },
        { text: "Certificates",              ok: false },
        { text: "Offline access",            ok: false },
      ],
    },
    {
      name: "Per Course",
      price: "Varies",
      desc: "Pay once, own forever",
      color: "border-blue-500",
      btn: "bg-blue-600 text-white hover:bg-blue-700",
      cta: "Browse Courses",
      to: "/courses",
      popular: true,
      features: [
        { text: "Full course access",        ok: true  },
        { text: "Certificate of completion", ok: true  },
        { text: "Downloadable resources",    ok: true  },
        { text: "Lifetime access",           ok: true  },
        { text: "Q&A with instructor",       ok: true  },
        { text: "Offline access",            ok: false },
      ],
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 px-4 text-center">
          <span className="inline-block text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Simple, transparent pricing</h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            No subscriptions, no hidden fees. Pay once per course and own it forever.
          </p>
        </div>

        {/* Plans — centered 2-column */}
        <div className="max-w-3xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border-2 ${plan.color} p-8 relative ${
                  plan.popular ? "shadow-2xl shadow-blue-100" : "shadow-sm"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-black px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-black text-slate-900 text-xl mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-400 mb-4">{plan.desc}</p>
                <p className="text-4xl font-black text-slate-900 mb-8">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(({ text, ok }) => (
                    <li
                      key={text}
                      className={`flex items-center gap-2 text-sm ${ok ? "text-slate-700" : "text-slate-300"}`}
                    >
                      {ok
                        ? <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                        : <X size={15} className="text-slate-300 shrink-0" />}
                      {text}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.to}
                  className={`block text-center py-3.5 rounded-xl font-bold text-sm transition ${plan.btn}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-slate-50 py-20 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                { q: "Do I need to subscribe?",     a: "No. LMSPRO uses a pay-per-course model. You pay once for a course and have lifetime access." },
                { q: "Are there free courses?",     a: "Yes! Many instructors offer free courses. Browse the catalogue and filter by price." },
                { q: "Can I get a refund?",         a: "Refunds are handled on a case-by-case basis. Contact support within 30 days of purchase." },
                { q: "How do I earn certificates?", a: "Complete 100% of a course's lessons to unlock your certificate of completion." },
                { q: "Is there a mobile app?",      a: "Our web app is fully responsive and works great on mobile browsers. A native app is coming soon." },
              ].map(({ q, a }) => (
                <div key={q} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-900 mb-2">{q}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}