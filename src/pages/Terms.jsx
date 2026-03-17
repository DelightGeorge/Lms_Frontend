import Layout from "../shared/Layout/Layout";
export default function Terms() {
  const sections = [
    { title:"1. Acceptance of Terms",           body:"By accessing or using LMSPRO ('the Platform'), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform." },
    { title:"2. Use of the Platform",           body:"You must be at least 13 years old to use LMSPRO. You agree to use the Platform only for lawful purposes and not to violate any applicable laws or regulations." },
    { title:"3. Account Registration",          body:"You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorised use." },
    { title:"4. Course Purchases",              body:"All course purchases are final unless a refund is requested within 30 days and less than 20% of the course has been completed. Payments are processed via Paystack and are subject to their terms." },
    { title:"5. Intellectual Property",         body:"All course content, including videos, text, quizzes, and resources, is owned by the respective instructors. You may not reproduce, distribute, or resell any content from LMSPRO without written permission." },
    { title:"6. Instructor Content",            body:"Instructors are solely responsible for the accuracy, quality, and legality of their course content. LMSPRO reserves the right to remove content that violates our community standards." },
    { title:"7. Revenue Sharing",               body:"Instructor revenue splits are: 37% for platform-sourced sales and 97% for instructor-referred sales (via referral link or coupon). Revenue rates may be updated with 30-day notice." },
    { title:"8. Prohibited Conduct",            body:"You may not: impersonate others, upload harmful or illegal content, attempt to reverse-engineer the Platform, or use the Platform to harass other users." },
    { title:"9. Limitation of Liability",       body:"LMSPRO is provided 'as is'. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform." },
    { title:"10. Changes to Terms",             body:"We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new terms. We will notify users by email of significant changes." },
    { title:"11. Governing Law",                body:"These Terms are governed by the laws of Nigeria. Any disputes shall be resolved in Nigerian courts." },
    { title:"12. Contact",                      body:"For questions about these Terms, contact us at delightgeorge105@gmail.com." },
  ];
  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16">
        <div className="bg-slate-900 text-white py-16 px-4 text-center">
          <h1 className="text-4xl font-black mb-3">Terms of Service</h1>
          <p className="text-slate-400">Last updated: March 2026</p>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
          <p className="text-slate-600 leading-relaxed">Please read these Terms of Service carefully before using LMSPRO. These terms govern your access to and use of our platform, including all courses, features, and services.</p>
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
