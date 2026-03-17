import Layout from "../shared/Layout/Layout";
export default function Cookies() {
  const types = [
    { name:"Essential Cookies",    required:true,  desc:"Required for the site to function. These include session cookies that keep you logged in and security cookies that protect against CSRF attacks." },
    { name:"Preference Cookies",   required:true,  desc:"Remember your settings such as theme preference and notification preferences so you don't have to set them every visit." },
    { name:"Analytics Cookies",    required:false, desc:"Help us understand how visitors interact with the Platform so we can improve it. Data is aggregated and anonymous." },
    { name:"Marketing Cookies",    required:false, desc:"Currently, LMSPRO does not use marketing or advertising cookies and does not share browsing data with advertisers." },
  ];
  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">
        <div className="bg-slate-900 text-white py-16 px-4 text-center">
          <h1 className="text-4xl font-black mb-3">Cookie Policy</h1>
          <p className="text-slate-400">Last updated: March 2026</p>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
          <p className="text-slate-600 leading-relaxed">Cookies are small text files stored on your device when you visit a website. LMSPRO uses cookies to keep you logged in, remember your preferences, and improve our service.</p>
          <div className="space-y-5">
            {types.map(({ name, required, desc }) => (
              <div key={name} className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-black text-slate-900">{name}</h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${required ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{required ? "Always Active" : "Optional"}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">Managing Cookies</h2>
            <p className="text-slate-600 text-sm leading-relaxed">You can control cookies through your browser settings. Note that disabling essential cookies may prevent you from logging in. For more control, contact us at <a href="mailto:delightgeorge105@gmail.com" className="text-blue-600 hover:underline font-semibold">delightgeorge105@gmail.com</a>.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
