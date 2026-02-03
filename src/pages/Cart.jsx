import React from "react";
import Layout from "../shared/Layout/Layout";

const Cart = () => {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        <div className="bg-white border rounded-2xl p-8 text-center">
          <p className="text-slate-500 mb-4">Your cart is empty.</p>
          <a
            href="/courses"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Browse Courses
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
