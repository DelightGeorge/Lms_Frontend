import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, ArrowRight, Linkedin, Twitter, Facebook, Instagram, Github } from "lucide-react";

const Footer = () => {
  const [email,      setEmail]      = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(""); setTimeout(() => setSubscribed(false), 3000); }
  };

  // Internal pages use Link (React Router)
  // Pages not yet built use a coming-soon fallback anchor
  const footerLinks = {
    Platform: [
      { label: "Browse Courses",    to: "/courses",            internal: true  },
      { label: "For Instructors",   to: "/for-instructors",    internal: true },
      { label: "For Businesses",    to: "/for-businesses",     internal: true },
      { label: "Pricing",           to: "/pricing",            internal: true },
    ],
    Company: [
      { label: "About Us",          to: "/about",              internal: true },
      { label: "Careers",           to: "/careers",            internal: true },
      { label: "Blog",              to: "/blog",               internal: true },
      { label: "Press Kit",         to: "/press",              internal: true },
    ],
    Resources: [
      { label: "Help Center",       to: "/help",               internal: true },
      { label: "Community",         to: "/community",          internal: true },
      { label: "Documentation",     to: "/docs",               internal: true },
      { label: "API Reference",     to: "/api-reference",      internal: true },
    ],
    Legal: [
      { label: "Terms of Service",  to: "/terms",              internal: true },
      { label: "Privacy Policy",    to: "/privacy",            internal: true },
      { label: "Cookie Policy",     to: "/cookies",            internal: true },
      { label: "Contact Us",        to: "/contact",            internal: true },
    ],
  };

  const socials = [
    { Icon: Twitter,   href: "#", label: "Twitter"   },
    { Icon: Linkedin,  href: "#", label: "LinkedIn"  },
    { Icon: Facebook,  href: "#", label: "Facebook"  },
    { Icon: Instagram, href: "#", label: "Instagram" },
    { Icon: Github,    href: "#", label: "GitHub"    },
  ];

  const NavLink = ({ to, children }) =>
    <Link to={to} className="text-sm text-slate-400 hover:text-amber-400 transition-colors duration-200 inline-block">{children}</Link>;

  return (
    <footer className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative">

        {/* Newsletter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-12 border-b border-slate-800/50">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-3">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Stay Updated</p>
              <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">Never miss a new course</h3>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                Get weekly course recommendations, exclusive discounts, and career tips delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-white/8 border border-white/10 rounded-lg px-4 py-3.5 text-white text-sm outline-none focus:border-amber-400/50 transition placeholder:text-slate-500"
                required />
              <button type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-6 py-3.5 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 active:scale-95 whitespace-nowrap">
                {subscribed ? "✓ Subscribed!" : <><span>Subscribe</span><ArrowRight size={16} /></>}
              </button>
            </form>
          </div>
        </div>

        {/* Links grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">

            {/* Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-5">
              <Link to="/" className="inline-flex items-center gap-2 group">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-blue-600/30">L</div>
                <span className="text-lg font-black text-white tracking-tight">LMS<span className="text-blue-400 italic">PRO</span></span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Premium online learning platform connecting ambitious professionals with world-class instructors and real-world skills.
              </p>
              <div className="flex items-center gap-2">
                {socials.map(({ Icon, href, label }) => (
                  <a key={label} href={href} aria-label={label}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/30 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all duration-300">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-4">
                <h4 className="font-bold text-white text-sm uppercase tracking-wider">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <NavLink to={link.to}>{link.label}</NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="grid md:grid-cols-3 gap-6 py-8 border-t border-slate-800/50">
            <a href="mailto:delightgeorge105@gmail.com"
              className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-300">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5 group-hover:bg-amber-500/20">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                <p className="text-sm text-white font-semibold">delightgeorge105@gmail.com</p>
              </div>
            </a>

            <a href="tel:+2347064102781"
              className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-300">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5 group-hover:bg-amber-500/20">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone</p>
                <p className="text-sm text-white font-semibold">+234 706 410 2781</p>
              </div>
            </a>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                <p className="text-sm text-white font-semibold">Nigeria 🇳🇬</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">© 2026 LMSPRO. All rights reserved.</p>
              <div className="flex items-center gap-6 flex-wrap justify-center">
                {["Status","Security","Accessibility","Sitemap"].map((label) => (
                  <span key={label} className="text-xs text-slate-500 cursor-not-allowed" title="Coming soon">{label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
