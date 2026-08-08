import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, ArrowRight, Linkedin, Twitter, Facebook, Instagram, Github } from "lucide-react";

const INK    = "#22262B";
const BLUE   = "#1B3A5C";
const PAPER  = "#EEF1F3";
const LINE   = "rgba(255,255,255,0.12)";
const MUTED  = "#8D96A0";
const ORANGE = "#D65A2E";
const DISPLAY_FONT = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const MONO_FONT    = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";

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
    <Link to={to} className="text-sm transition-colors duration-200 inline-block hover:text-white"
      style={{ color: MUTED }}>{children}</Link>;

  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: "#12283D", color: MUTED }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />

      <div className="relative">

        {/* Newsletter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-12 border-b" style={{ borderColor: LINE }}>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ORANGE, fontFamily: MONO_FONT }}>Mailing list</p>
              <h3 className="text-3xl md:text-4xl font-black text-white leading-tight" style={{ fontFamily: DISPLAY_FONT }}>
                Get notified about new courses
              </h3>
              <p className="text-base leading-relaxed max-w-md" style={{ color: MUTED }}>
                One email a week. New course drops, no filler.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 bg-white/5 border rounded-sm px-4 py-3.5 text-white text-sm outline-none transition placeholder:text-white/30"
                style={{ borderColor: LINE }}
                required />
              <button type="submit"
                className="text-white px-6 py-3.5 rounded-sm font-bold text-sm transition flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
                style={{ backgroundColor: ORANGE }}>
                {subscribed ? "Subscribed" : <><span>Subscribe</span><ArrowRight size={16} /></>}
              </button>
            </form>
          </div>
        </div>

        {/* Links grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">

            {/* Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-5">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="w-9 h-9 rounded-sm flex items-center justify-center text-white font-black text-lg" style={{ backgroundColor: BLUE, fontFamily: DISPLAY_FONT }}>L</div>
                <span className="text-lg font-black tracking-tight text-white" style={{ fontFamily: DISPLAY_FONT }}>
                  LMS<span style={{ color: ORANGE }}>PRO</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: MUTED }}>
                A course catalog built by practitioners, for people who want to build something real.
              </p>
              <div className="flex items-center gap-2">
                {socials.map(({ Icon, href, label }) => (
                  <a key={label} href={href} aria-label={label}
                    className="w-9 h-9 rounded-sm border flex items-center justify-center transition-colors hover:text-white hover:border-white/30"
                    style={{ borderColor: LINE, color: MUTED }}>
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-4">
                <h4 className="font-bold text-white text-xs uppercase tracking-widest" style={{ fontFamily: MONO_FONT }}>{title}</h4>
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
          <div className="grid md:grid-cols-3 gap-6 py-8 border-t" style={{ borderColor: LINE }}>
            <a href="mailto:delightgeorge105@gmail.com"
              className="flex items-start gap-3 group transition-transform duration-300 hover:translate-x-1">
              <div className="w-9 h-9 rounded-sm border flex items-center justify-center flex-shrink-0 mt-0.5" style={{ borderColor: LINE, color: ORANGE }}>
                <Mail size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: MUTED, fontFamily: MONO_FONT }}>Email</p>
                <p className="text-sm text-white font-semibold">delightgeorge105@gmail.com</p>
              </div>
            </a>

            <a href="tel:+2347064102781"
              className="flex items-start gap-3 group transition-transform duration-300 hover:translate-x-1">
              <div className="w-9 h-9 rounded-sm border flex items-center justify-center flex-shrink-0 mt-0.5" style={{ borderColor: LINE, color: ORANGE }}>
                <Phone size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: MUTED, fontFamily: MONO_FONT }}>Phone</p>
                <p className="text-sm text-white font-semibold">+234 706 410 2781</p>
              </div>
            </a>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-sm border flex items-center justify-center flex-shrink-0 mt-0.5" style={{ borderColor: LINE, color: ORANGE }}>
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: MUTED, fontFamily: MONO_FONT }}>Location</p>
                <p className="text-sm text-white font-semibold">Nigeria</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t py-6" style={{ borderColor: LINE }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm" style={{ color: MUTED, fontFamily: MONO_FONT }}>© 2026 LMSPRO</p>
              <div className="flex items-center gap-6 flex-wrap justify-center">
                {["Status","Security","Accessibility","Sitemap"].map((label) => (
                  <span key={label} className="text-xs cursor-not-allowed" style={{ color: "#5B6570", fontFamily: MONO_FONT }} title="Coming soon">{label}</span>
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