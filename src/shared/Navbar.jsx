import { Search, ShoppingCart, Globe, ChevronDown } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 h-16 flex items-center gap-4">
        
        {/* Logo */}
        <a href="/" className="text-2xl font-bold text-blue-700 tracking-tighter shrink-0">
          LMS<span className="text-slate-900">PRO</span>
        </a>

        {/* Categories - Unique Hover Dropdown */}
        <button className="hidden lg:flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600 px-2">
          Categories
        </button>

        {/* Search Bar - The Udemy Centerpiece */}
        <div className="flex-1 max-w-2xl relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={18} />
          <input 
            type="text" 
            placeholder="Search for any skill..."
            className="w-full bg-gray-50 border border-gray-300 rounded-full py-2 pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <a href="/instructor" className="hidden xl:block text-sm text-gray-700 hover:text-blue-600 px-2">
            Teach on LMS
          </a>
          
          <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-full">
            <ShoppingCart size={20} />
          </button>

          <div className="flex items-center gap-2 border-l pl-3 border-gray-200">
            <a href="/login" className="px-5 py-2 text-sm font-bold border border-slate-900 hover:bg-gray-50 transition">
              Log in
            </a>
            <a href="/register" className="px-5 py-2 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition">
              Sign up
            </a>
          </div>
          
          <button className="p-2 border border-slate-900 hover:bg-gray-100">
            <Globe size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;