import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../shared/Layout/Layout";
import {
  ShoppingCart, Trash2, Loader2, BookOpen,
  ArrowRight, Tag, CheckCircle, Sparkles, Lock,
} from "lucide-react";
import API from "../services/api";
import { initializePayment } from "../services/paymentService";
import { enrollFree } from "../services/enrollmentService";
import { useAuth } from "../Context/AuthContext";

const placeholderImgs = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
];

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});
  const [paying, setPaying] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCart = () => {
    if (!user) {
      setLoading(false);
      return;
    }
    API.get("/cart")
      .then((r) => setCart(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const removeItem = async (itemId) => {
    setRemoving((p) => ({ ...p, [itemId]: true }));
    try {
      await API.delete(`/cart/${itemId}`);
      fetchCart();
      showToast("Item removed from cart");
    } catch {
      showToast("Failed to remove item", "error");
    } finally {
      setRemoving((p) => ({ ...p, [itemId]: false }));
    }
  };

  const handleCheckout = async (item) => {
    const course = item.course;
    setPaying((p) => ({ ...p, [item.id]: true }));
    try {
      if (course.price === 0) {
        await enrollFree(course.id);
        await API.delete(`/cart/${item.id}`);
        showToast("Enrolled successfully!");
        fetchCart();
        setTimeout(() => navigate("/StudentDashboard"), 1500);
      } else {
        const res = await initializePayment(course.id);
        window.location.href = res.data.authorizationUrl;
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Checkout failed", "error");
    } finally {
      setPaying((p) => ({ ...p, [item.id]: false }));
    }
  };

  const handleCheckoutAll = async () => {
    if (!cart?.items?.length) return;
    const paidItems = cart.items.filter((i) => i.course.price > 0);
    const freeItems = cart.items.filter((i) => i.course.price === 0);

    for (const item of freeItems) {
      try {
        await enrollFree(item.course.id);
        await API.delete(`/cart/${item.id}`);
      } catch {}
    }

    if (paidItems.length > 0) {
      try {
        const res = await initializePayment(paidItems[0].course.id);
        window.location.href = res.data.authorizationUrl;
      } catch (err) {
        showToast(err.response?.data?.message || "Payment failed", "error");
      }
    } else {
      showToast("All free courses enrolled!");
      fetchCart();
      setTimeout(() => navigate("/StudentDashboard"), 1500);
    }
  };

  const items = cart?.items || [];
  const total = items.reduce((acc, i) => acc + (i.course?.price || 0) * (i.quantity || 1), 0);
  const freeCount = items.filter((i) => i.course?.price === 0).length;
  const paidCount = items.filter((i) => i.course?.price > 0).length;

  if (!user)
    return (
      <Layout hideFloatingBar={true}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4 pt-20">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-12 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShoppingCart size={32} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Sign in to view cart</h2>
            <p className="text-slate-500 text-sm mb-6">You need to be logged in to access your shopping cart</p>
            <Link
              to="/auth"
              className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-600/20"
            >
              Sign In
            </Link>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout hideFloatingBar={true}>
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[999] px-6 py-4 rounded-xl text-white font-bold shadow-2xl text-sm backdrop-blur-xl border ${
            toast.type === "error"
              ? "bg-red-500/90 border-red-400/50 shadow-red-600/20"
              : "bg-emerald-500/90 border-emerald-400/50 shadow-emerald-600/20"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 pt-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white px-4 py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                <ShoppingCart size={24} className="text-amber-300" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Your Cart</h1>
            </div>
            <p className="text-slate-300 text-sm">
              {items.length === 0
                ? "Nothing here yet"
                : `${items.length} course${items.length !== 1 ? "s" : ""} · $${total.toFixed(2)} total`}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={40} className="animate-spin text-amber-500" />
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ShoppingCart size={44} className="text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h3>
              <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
                Browse our premium courses and add them to your cart to get started on your learning journey
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-xl font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-600/20"
              >
                <Sparkles size={16} /> Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, idx) => {
                  const course = item.course;
                  const img = course?.thumbnail || placeholderImgs[idx % placeholderImgs.length];
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex gap-4">
                        <img
                          src={img}
                          alt={course?.title}
                          className="w-28 h-20 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-slate-900 text-sm line-clamp-2 mb-1 group-hover:text-amber-600 transition-colors">
                            {course?.title}
                          </h3>
                          <p className="text-xs text-slate-500 mb-3">{course?.instructor?.fullName}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {course?.category?.name && (
                              <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2.5 py-0.5 rounded-full">
                                {course.category.name}
                              </span>
                            )}
                            <span className={`text-xs font-black ${course?.price === 0 ? "text-emerald-600" : "text-slate-900"}`}>
                              {course?.price === 0 ? "🎁 Free" : `$${course?.price}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={removing[item.id]}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition"
                          >
                            {removing[item.id] ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                          <button
                            onClick={() => handleCheckout(item)}
                            disabled={paying[item.id]}
                            className={`text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1 whitespace-nowrap ${
                              course?.price === 0
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                : "bg-amber-50 hover:bg-amber-100 text-amber-700"
                            }`}
                          >
                            {paying[item.id] ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : course?.price === 0 ? (
                              <CheckCircle size={13} />
                            ) : (
                              <ArrowRight size={13} />
                            )}
                            {course?.price === 0 ? "Enroll Free" : "Checkout"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-32 space-y-6">
                  <div>
                    <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                      <Tag size={18} className="text-amber-500" /> Order Summary
                    </h3>

                    <div className="space-y-3 pb-4 border-b border-slate-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          {items.length} course{items.length !== 1 ? "s" : ""}
                        </span>
                        <span className="font-bold text-slate-900">${total.toFixed(2)}</span>
                      </div>
                      {freeCount > 0 && (
                        <div className="flex justify-between text-sm bg-emerald-50 px-3 py-2 rounded-lg">
                          <span className="text-emerald-700 font-semibold">Free courses</span>
                          <span className="font-bold text-emerald-700">{freeCount}</span>
                        </div>
                      )}
                      {paidCount > 0 && (
                        <div className="flex justify-between text-sm bg-amber-50 px-3 py-2 rounded-lg">
                          <span className="text-amber-700 font-semibold">Paid courses</span>
                          <span className="font-bold text-amber-700">{paidCount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between mb-4">
                      <span className="font-black text-slate-900">Total</span>
                      <span className="text-2xl font-black text-amber-600">${total.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={handleCheckoutAll}
                      disabled={items.length === 0}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-amber-600/30 text-sm flex items-center justify-center gap-2 active:scale-95"
                    >
                      <ArrowRight size={16} />
                      {paidCount > 0 ? "Proceed to Checkout" : "Enroll All Free"}
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-start gap-2 text-xs text-slate-500">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>30-day money-back guarantee</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-500">
                      <Lock size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      <span>Secure payment via Paystack</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
