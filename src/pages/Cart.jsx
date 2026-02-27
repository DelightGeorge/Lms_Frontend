import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../shared/Layout/Layout";
import {
  ShoppingCart, Trash2, Loader2, BookOpen,
  ArrowRight, Tag, CheckCircle,
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
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [cart,       setCart]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [removing,   setRemoving]   = useState({});
  const [paying,     setPaying]     = useState({});
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCart = () => {
    if (!user) { setLoading(false); return; }
    API.get("/cart")
      .then((r) => setCart(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCart(); }, [user]);

  const removeItem = async (itemId) => {
    setRemoving((p) => ({ ...p, [itemId]: true }));
    try {
      await API.delete(`/cart/${itemId}`);
      fetchCart();
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
    // Process first paid item or all free ones
    const paidItems  = cart.items.filter((i) => i.course.price > 0);
    const freeItems  = cart.items.filter((i) => i.course.price === 0);

    // Enroll free courses first
    for (const item of freeItems) {
      try {
        await enrollFree(item.course.id);
        await API.delete(`/cart/${item.id}`);
      } catch { /* already enrolled is fine */ }
    }

    if (paidItems.length > 0) {
      // Pay for first paid item (Paystack is per-transaction)
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

  const items  = cart?.items || [];
  const total  = items.reduce((acc, i) => acc + (i.course?.price || 0) * (i.quantity || 1), 0);
  const freeCount = items.filter((i) => i.course?.price === 0).length;
  const paidCount = items.filter((i) => i.course?.price > 0).length;

  if (!user) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-md w-full">
          <ShoppingCart size={48} className="text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-800 mb-2">Sign in to view your cart</h2>
          <Link to="/auth" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
            Sign In
          </Link>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      {toast && (
        <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-2xl text-white font-bold shadow-2xl text-sm
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart size={28} className="text-blue-400" />
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Your Cart</h1>
            </div>
            <p className="text-slate-300 text-sm">
              {items.length === 0 ? "Nothing here yet" : `${items.length} course${items.length !== 1 ? "s" : ""} · $${total.toFixed(2)} total`}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <ShoppingCart size={36} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Your cart is empty</h3>
              <p className="text-slate-400 text-sm mb-6">Browse courses and add them to your cart</p>
              <Link to="/courses"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
                Browse Courses <ArrowRight size={16} />
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
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex gap-4">
                      <img src={img} alt={course?.title} className="w-24 h-16 object-cover rounded-xl shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-800 text-sm truncate">{course?.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{course?.instructor?.fullName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {course?.category?.name && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                              {course.category.name}
                            </span>
                          )}
                          <span className={`text-xs font-black ${course?.price === 0 ? "text-emerald-600" : "text-slate-800"}`}>
                            {course?.price === 0 ? "Free" : `$${course?.price}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button onClick={() => removeItem(item.id)} disabled={removing[item.id]}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition">
                          {removing[item.id] ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                        <button
                          onClick={() => handleCheckout(item)}
                          disabled={paying[item.id]}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                            course?.price === 0
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {paying[item.id]
                            ? <Loader2 size={12} className="animate-spin" />
                            : course?.price === 0 ? <CheckCircle size={12} /> : <ArrowRight size={12} />
                          }
                          {course?.price === 0 ? "Enroll Free" : "Pay Now"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-24">
                  <h3 className="font-black text-slate-800 mb-5">Order Summary</h3>

                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{items.length} course{items.length !== 1 ? "s" : ""}</span>
                      <span className="font-bold">${total.toFixed(2)}</span>
                    </div>
                    {freeCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Free courses</span>
                        <span className="font-bold text-emerald-600">{freeCount}</span>
                      </div>
                    )}
                    {paidCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Paid courses</span>
                        <span className="font-bold">{paidCount}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-slate-800">
                      <span>Total</span>
                      <span className="text-blue-600">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckoutAll}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 text-sm flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={16} />
                    {paidCount > 0 ? "Checkout" : "Enroll All Free"}
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-3">
                    Secure payment via Paystack
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Tag size={12} /> 30-day money-back guarantee
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