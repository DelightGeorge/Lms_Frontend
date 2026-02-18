import React from "react";
import { useSearchParams, Link } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status"); // success or error

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
      <div className="bg-gray-800 p-12 rounded-xl shadow-lg text-center max-w-md">
        {status === "success" ? (
          <>
            <h1 className="text-3xl font-bold mb-4 text-green-500">
              ✅ Email Verified!
            </h1>
            <p className="mb-6">Your account is now active. You can log in.</p>
            <Link
              to="/auth"
              className="px-6 py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500"
            >
              Go to Login
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4 text-red-500">
              ❌ Verification Failed
            </h1>
            <p className="mb-6">Invalid or expired verification link.</p>
            <Link
              to="/auth"
              className="px-6 py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500"
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
