import { useState } from "react";
import { BookOpen, Code, Users, DollarSign, Award, ChevronRight, Search, ExternalLink } from "lucide-react";
import Layout from "../shared/Layout/Layout";

const sections = [
  { id:"getting-started", icon: BookOpen, title:"Getting Started",
    articles:[
      { title:"Create your account",      content:"Go to the homepage and click 'Sign Up'. Fill in your full name, email address, and a secure password. Check your email for a verification link and click it to activate your account." },
      { title:"Log in to your account",   content:"Visit the homepage and click 'Log In'. Enter your registered email and password. Use 'Forgot Password' if needed." },
      { title:"Browse and search courses", content:"Use the search bar at the top of any page to search by keyword, topic, or instructor name. You can also browse by category from the Courses page." },
      { title:"Enrol in a course",        content:"Open a course page and click 'Enrol Now'. Free courses enrol instantly. Paid courses open a secure Paystack checkout. After payment, you are automatically enrolled." },
    ]
  },
  { id:"learning",       icon: Award,    title:"Learning & Progress",
    articles:[
      { title:"Watching lessons",         content:"Open your enrolled course and click any lesson. Video lessons auto-play. Text lessons display inline. Mark each lesson as complete using the button at the bottom." },
      { title:"Taking quizzes",           content:"Quizzes appear inside courses. Select your answers and click Submit. Your score is displayed immediately. You can retake quizzes." },
      { title:"Earning certificates",     content:"Complete all lessons in a course to unlock your certificate. Download it as PDF or share via URL from your dashboard." },
      { title:"Tracking your progress",  content:"Your student dashboard shows progress percentages for each enrolled course. The progress bar updates as you complete lessons." },
    ]
  },
  { id:"payments",       icon: DollarSign,title:"Payments & Billing",
    articles:[
      { title:"How to pay for a course",  content:"Click 'Enrol Now' on a paid course. You'll be redirected to a Paystack checkout. Enter your card details (Visa, Mastercard, or Verve). After payment, you are enrolled automatically." },
      { title:"Using a coupon code",      content:"On the checkout page, enter a coupon code in the 'Have a coupon?' field and click Apply. The discount will be applied to the total before payment." },
      { title:"Payment failed",          content:"If payment fails, check your card details and ensure your bank has approved online transactions. Try again or contact your bank. Reach support at delightgeorge105@gmail.com." },
      { title:"Refund policy",           content:"Refunds are available within 30 days of purchase for courses where less than 20% has been completed. Email delightgeorge105@gmail.com with your order reference." },
    ]
  },
  { id:"instructors",    icon: Users,    title:"Instructor Guide",
    articles:[
      { title:"Applying to teach",        content:"Click 'Become an Instructor' in the navigation. Complete the application form with your bio, expertise, years of experience, and a sample video. Submit your ID and CV. Applications are reviewed in 2–3 business days." },
      { title:"Creating a course",       content:"From your instructor dashboard, click 'New Course'. Add a title, description, thumbnail, and price. Add lessons (video or text) and optionally add quizzes. Submit for review when ready." },
      { title:"Revenue and earnings",    content:"You earn 37% on platform-sourced sales and 97% on sales from your referral link or coupon code. Earnings are held for 30 days then released to your available balance." },
      { title:"Requesting a payout",    content:"From your Wallet page, once your available balance reaches $25, click 'Request Payout'. Enter your bank account or PayPal details and submit. Admin processes requests within 1–3 business days." },
    ]
  },
];

export default function Documentation() {
  const [active, setActive] = useState("getting-started");
  const [search, setSearch] = useState("");
  const [openArticle, setOpenArticle] = useState(null);

  const activeSection = sections.find((s) => s.id === active);
  const filtered = activeSection?.articles.filter((a) =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block text-xs font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">Documentation</span>
            <h1 className="text-4xl font-black mb-3">LMSPRO Docs</h1>
            <p className="text-slate-300 mb-6">Everything you need to know about using LMSPRO as a learner or instructor.</p>
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documentation..."
                className="w-full bg-white text-slate-900 rounded-xl py-3 pl-11 pr-4 outline-none text-sm" />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-14 flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sections</p>
            <nav className="space-y-1">
              {sections.map(({ id, icon: Icon, title }) => (
                <button key={id} onClick={() => { setActive(id); setOpenArticle(null); setSearch(""); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition ${active === id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
                  <Icon size={14} /> {title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1">
            <h2 className="text-2xl font-black text-slate-900 mb-6">{activeSection?.title}</h2>
            {filtered?.length === 0 ? (
              <p className="text-slate-400 py-8">No articles match your search.</p>
            ) : (
              <div className="space-y-3">
                {filtered?.map((article) => (
                  <div key={article.title} className="border border-slate-100 rounded-2xl overflow-hidden hover:border-blue-200 transition">
                    <button onClick={() => setOpenArticle(openArticle === article.title ? null : article.title)}
                      className="w-full flex items-center justify-between p-5 text-left">
                      <span className="font-bold text-slate-900 text-sm">{article.title}</span>
                      <ChevronRight size={15} className={`text-slate-400 transition-transform ${openArticle === article.title ? "rotate-90" : ""}`} />
                    </button>
                    {openArticle === article.title && (
                      <div className="px-5 pb-5 border-t border-slate-50 pt-4 text-sm text-slate-600 leading-relaxed">{article.content}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
