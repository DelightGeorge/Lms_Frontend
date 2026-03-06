// src/pages/Student/PaymentCallbackPage.jsx
//
// Paystack redirects here after payment.
// URL: /payment/callback?reference=XXX&courseId=XXX
//
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, BookOpen, ArrowRight, Home } from "lucide-react";
import API from "../services/api";


const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const reference = searchParams.get("reference");
  const courseId  = searchParams.get("courseId");

  const [status,  setStatus]  = useState("loading"); // loading | success | failed
  const [course,  setCourse]  = useState(null);

  useEffect(() => {
    if (!reference) { setStatus("failed"); return; }

    (async () => {
      try {
        const res = await API.get(`/payments/verify/${reference}`);
        if (res.data.success) {
          setStatus("success");
          // Load course info for the success screen
          if (courseId) {
            try {
              const cr = await API.get(`/courses/${courseId}`);
              setCourse(cr.data);
            } catch {}
          }
          // Auto-redirect after 4 seconds
          setTimeout(() => navigate(`/course/${courseId || ""}`), 4000);
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    })();
  }, [reference]);

  if (status === "loading") return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
        <p className="font-black text-slate-700 text-lg">Verifying your payment...</p>
        <p className="text-slate-400 text-sm">Please don't close this page</p>
      </div>
    </div>
  );

  if (status === "success") return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md p-8 text-center">
        {/* Animated checkmark */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">You're Enrolled! 🎉</h1>
        <p className="text-slate-500 text-sm mb-6">
          Your payment was successful. You now have lifetime access to this course.
        </p>

        {course && (
          <div className="bg-slate-50 rounded-2xl p-4 flex gap-3 items-center text-left mb-6">
            <div className="w-14 h-10 rounded-xl overflow-hidden bg-slate-200 shrink-0">
              {course.thumbnail
                ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><BookOpen size={14} className="text-slate-400" /></div>}
            </div>
            <div className="min-w-0">
              <p className="font-black text-slate-800 text-sm truncate">{course.title}</p>
              <p className="text-xs text-slate-400">{course._count?.lessons || 0} lessons · Lifetime access</p>
            </div>
          </div>
        )}

        <Link to={`/course/${courseId || ""}`}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition mb-3">
          Start Learning <ArrowRight size={15} />
        </Link>

        <p className="text-xs text-slate-400">Redirecting automatically in a few seconds...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-500" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">Payment Failed</h1>
        <p className="text-slate-500 text-sm mb-6">
          Your payment was not completed. No charge was made. Please try again.
        </p>

        <div className="space-y-3">
          {courseId && (
            <Link to={`/checkout?courseId=${courseId}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition">
              Try Again
            </Link>
          )}
          <Link to="/"
            className="w-full flex items-center justify-center gap-2 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition">
            <Home size={14} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
