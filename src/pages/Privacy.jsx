import Layout from "../shared/Layout/Layout";
export default function Privacy() {
  const sections = [
    { title:"1. Information We Collect",          body:"We collect information you provide directly (name, email, password), payment information processed via Paystack, course activity (progress, quiz scores, completions), and usage data (pages visited, search queries)." },
    { title:"2. How We Use Your Information",      body:"We use your information to: provide and improve the Platform, process payments, send course-related notifications, personalise your learning experience, and communicate platform updates." },
    { title:"3. Information Sharing",             body:"We do not sell your personal data. We share data only with: Paystack (payment processing), Cloudinary (file storage), and as required by Nigerian law. Instructors see only aggregate data about their course enrollments." },
    { title:"4. Data Storage & Security",         body:"Your data is stored on secure servers. We use HTTPS encryption for all data in transit and implement industry-standard security measures. However, no system is 100% secure." },
    { title:"5. Cookies",                         body:"We use essential cookies to keep you logged in and remember preferences. We do not use advertising cookies or sell browsing data to third parties." },
    { title:"6. Your Rights",                     body:"You have the right to: access your personal data, correct inaccurate data, request deletion of your account, and export your data. Email delightgeorge105@gmail.com to exercise these rights." },
    { title:"7. Children's Privacy",              body:"LMSPRO is not directed at children under 13. We do not knowingly collect personal information from children. Contact us if you believe a child has provided personal data." },
    { title:"8. Changes to This Policy",          body:"We may update this Privacy Policy periodically. We will notify you by email and update the 'last updated' date. Continued use of LMSPRO after changes constitutes acceptance." },
    { title:"9. Contact",                         body:"For privacy concerns or data requests, contact delightgeorge105@gmail.com. We respond within 5 business days." },
  ];
  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">
        <div className="bg-slate-900 text-white py-16 px-4 text-center">
          <h1 className="text-4xl font-black mb-3">Privacy Policy</h1>
          <p className="text-slate-400">Last updated: March 2026</p>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
          <p className="text-slate-600 leading-relaxed">At LMSPRO, we take your privacy seriously. This policy explains what data we collect, how we use it, and your rights regarding your personal information.</p>
          {sections.map(({ title, body }) => (
            <div key={title}>
              <h2 className="text-lg font-black text-slate-900 mb-2">{title}</h2>
              <p className="text-slate-600 leading-relaxed text-sm">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
