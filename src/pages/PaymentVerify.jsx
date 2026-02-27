import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { verifyPayment } from "../services/paymentService";
import Layout from "../shared/Layout/Layout";

const PaymentVerify = () => {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const [status,   setStatus]  = useState("loading"); // loading | success | failed
  const [courseId, setCourseId] = useState(null);

  useEffect(() => {
    const reference = params.get("reference");
    const cid       = params.get("courseId");
    setCourseId(cid);

    if (!reference) { setStatus("failed"); return; }

    verifyPayment(reference)
      .then((r) => {
        if (r.data.success) {
          setStatus("success");
          setTimeout(() => navigate("/StudentDashboard"), 3000);
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, []);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          {status === "loading" && (
            <>
              <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-black text-slate-800">Verifying Payment...</h2>
              <p className="text-slate-400 text-sm mt-2">Please wait while we confirm your payment.</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Payment Successful!</h2>
              <p className="text-slate-500 text-sm mb-6">You're now enrolled. Redirecting to your dashboard...</p>
              <Link to="/StudentDashboard"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition text-sm">
                Go to Dashboard
              </Link>
            </>
          )}
          {status === "failed" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={36} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Payment Failed</h2>
              <p className="text-slate-500 text-sm mb-6">Something went wrong. Please try again.</p>
              <div className="flex gap-3 justify-center">
                {courseId && (
                  <Link to={`/courses/${courseId}`}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition text-sm">
                    Try Again
                  </Link>
                )}
                <Link to="/courses"
                  className="px-5 py-2.5 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition text-sm">
                  Browse Courses
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentVerify;