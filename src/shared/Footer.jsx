import React from "react";
import { Globe, Twitter, Linkedin, Facebook, Youtube, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-slate-300 pt-12 md:pt-20 pb-10 mt-24">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* 1. NEWSLETTER / PRE-FOOTER SECTION */}
{/* 1. NEWSLETTER / PRE-FOOTER SECTION */}
<div className="bg-blue-600 rounded-3xl p-6 md:p-12 mb-12 md:mb-20 flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-between gap-6 lg:gap-8 shadow-2xl shadow-blue-900/20">
  
  {/* Text */}
  <div className="max-w-md text-center lg:text-left">
    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
      Ready to master a new skill?
    </h3>
    <p className="text-blue-100 text-sm md:text-base">
      Join 5,000+ students getting weekly career tips and course discounts.
    </p>
  </div>

  {/* Input + Button */}
  <div className="flex flex-col sm:flex-row w-full max-w-md gap-3 mt-4 lg:mt-0">
    <input 
      type="email" 
      placeholder="Enter your email" 
      className="flex-1 bg-white px-4 py-3 rounded-2xl text-slate-900 text-sm md:text-base outline-none placeholder:text-slate-400"
    />
    <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto">
      Subscribe <ArrowRight size={16} />
    </button>
  </div>
</div>


        {/* 2. MAIN NAVIGATION GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 mb-12 md:mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-6 text-center sm:text-left">
            <a href="/" className="text-2xl font-black tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm italic">L</div>
              LMS<span className="text-blue-400">PRO</span>
            </a>
            <p className="text-sm leading-relaxed max-w-sm mx-auto sm:mx-0">
              We provide world-class learning experiences with industry experts. 
              Our mission is to make education accessible and career-focused for everyone, everywhere.
            </p>
            <div className="flex justify-center sm:justify-start gap-4">
              {[Twitter, Linkedin, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-blue-500 hover:border-blue-500 hover:text-white transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <FooterColumn 
            title="Platform" 
            links={["LMS Business", "Teach on LMS", "Get the App", "About us"]} 
          />
          <FooterColumn 
            title="Resources" 
            links={["Careers", "Blog", "Help & Support", "Affiliate"]} 
          />
          <FooterColumn 
            title="Legal" 
            links={["Terms", "Privacy Policy", "Cookie Settings", "Sitemap"]} 
          />
        </div>

        {/* 3. BOTTOM BAR */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-6">
            <button className="flex items-center gap-2 text-sm font-semibold hover:text-white transition-colors justify-center md:justify-start">
              <Globe size={16} className="text-blue-400" />
              English
            </button>
            <p className="text-xs text-slate-500">
              © 2026 LMS PRO, Inc. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Status</span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Security</span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Contact</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

// Helper component for clean mapping
const FooterColumn = ({ title, links }) => (
  <div className="space-y-4 text-center sm:text-left">
    <h4 className="font-bold text-white text-sm uppercase tracking-wider">{title}</h4>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link}>
          <a href="#" className="text-sm hover:text-blue-400 transition-colors">
            {link}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;
