import { Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 mt-24">
      <div className="max-w-[1440px] mx-auto px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="space-y-3">
            <h4 className="font-bold">LMS Pro Business</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="hover:underline cursor-pointer">Teach on LMS</li>
              <li className="hover:underline cursor-pointer">Get the app</li>
              <li className="hover:underline cursor-pointer">About us</li>
              <li className="hover:underline cursor-pointer">Contact us</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold">Resources</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="hover:underline cursor-pointer">Careers</li>
              <li className="hover:underline cursor-pointer">Blog</li>
              <li className="hover:underline cursor-pointer">Help & Support</li>
              <li className="hover:underline cursor-pointer">Affiliate</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold">Legal & Privacy</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="hover:underline cursor-pointer">Terms</li>
              <li className="hover:underline cursor-pointer">Privacy policy</li>
              <li className="hover:underline cursor-pointer">Cookie settings</li>
              <li className="hover:underline cursor-pointer">Sitemap</li>
            </ul>
          </div>

          <div className="flex justify-end items-start">
             <button className="flex items-center gap-2 border border-white px-6 py-2 hover:bg-slate-800 transition">
               <Globe size={16} />
               <span>English</span>
             </button>
          </div>
        </div>

        {/* Bottom Branding */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800 gap-4">
          <h2 className="text-2xl font-bold tracking-tighter">
            LMS<span className="text-blue-400">PRO</span>
          </h2>
          <p className="text-[12px] text-gray-400">
            &copy; 2026 LMS PRO, Inc. Built by SoloDev.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;