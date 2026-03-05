// ─────────────────────────────────────────────────────────────────────────────
// FILE 1:  src/components/ReviewSection.jsx
// Drop this into CourseDetail wherever the Reviews tab renders.
// Props:  courseId, isEnrolled, currentUser
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Star, Loader2, Trash2, Edit2, MessageSquare } from "lucide-react";
import API from "../services/api";

// ── Star picker (clickable) ───────────────────────────────────────────────────
const StarPicker = ({ value, onChange, disabled }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={disabled}
        onClick={() => onChange(n)}
        className={`transition-transform hover:scale-110 disabled:cursor-not-allowed ${n <= value ? "text-amber-400" : "text-slate-200"}`}
      >
        <Star size={24} className={n <= value ? "fill-amber-400" : "fill-slate-200"} />
      </button>
    ))}
  </div>
);

// ── Star display (read-only) ──────────────────────────────────────────────────
const StarDisplay = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={size} className={n <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
    ))}
  </div>
);

// ── Rating histogram ──────────────────────────────────────────────────────────
const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-500 w-3 shrink-0">{star}</span>
      <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-400 w-5 text-right shrink-0">{count}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ReviewSection = ({ courseId, isEnrolled, currentUser }) => {
  const [reviews,        setReviews]        = useState([]);
  const [averageRating,  setAverageRating]  = useState(0);
  const [totalReviews,   setTotalReviews]   = useState(0);
  const [myReview,       setMyReview]       = useState(null);   // existing review
  const [loading,        setLoading]        = useState(true);
  const [submitting,     setSubmitting]     = useState(false);
  const [deleting,       setDeleting]       = useState(false);
  const [isEditing,      setIsEditing]      = useState(false);
  const [toast,          setToast]          = useState(null);

  // form state
  const [rating,   setRating]   = useState(0);
  const [comment,  setComment]  = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch reviews + my review ─────────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    Promise.all([
      API.get(`/reviews/course/${courseId}`),
      currentUser ? API.get(`/reviews/my/${courseId}`) : Promise.resolve({ data: { review: null } }),
    ])
      .then(([reviewsRes, myRes]) => {
        const data = reviewsRes.data;
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
        if (myRes.data?.review) {
          setMyReview(myRes.data.review);
          // pre-fill form with existing review
          setRating(myRes.data.review.rating);
          setComment(myRes.data.review.comment || "");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId, currentUser]);

  // ── Submit / update review ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { showToast("Please select a star rating", "error"); return; }
    setSubmitting(true);
    try {
      const res = await API.post("/reviews", { courseId, rating, comment });
      const { review, averageRating: avg, totalReviews: total } = res.data;

      setMyReview(review);
      setAverageRating(avg);
      setTotalReviews(total);
      // Update or add in the list
      setReviews((prev) => {
        const exists = prev.find((r) => r.userId === currentUser?.id);
        return exists
          ? prev.map((r) => r.userId === currentUser?.id ? review : r)
          : [review, ...prev];
      });
      setIsEditing(false);
      showToast(myReview ? "Review updated!" : "Review submitted! Thanks for your feedback.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete own review ─────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!myReview || !window.confirm("Delete your review?")) return;
    setDeleting(true);
    try {
      const res = await API.delete(`/reviews/${myReview.id}`);
      setMyReview(null);
      setRating(0);
      setComment("");
      setAverageRating(res.data.averageRating);
      setTotalReviews(res.data.totalReviews);
      setReviews((prev) => prev.filter((r) => r.id !== myReview.id));
      showToast("Review deleted.");
    } catch (err) {
      showToast("Failed to delete review", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ── Histogram data ────────────────────────────────────────────────────────
  const histogram = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map((i) => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-2xl text-white font-bold shadow-2xl text-sm ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Rating summary ── */}
      {totalReviews > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 rounded-2xl p-5">
          {/* Big number */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <span className="text-5xl font-black text-slate-900 leading-none">{averageRating}</span>
            <StarDisplay rating={averageRating} size={18} />
            <p className="text-xs text-slate-400 mt-1">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
          </div>
          {/* Histogram */}
          <div className="flex-1 space-y-1.5 justify-center flex flex-col">
            {histogram.map(({ star, count }) => (
              <RatingBar key={star} star={star} count={count} total={totalReviews} />
            ))}
          </div>
        </div>
      )}

      {/* ── Review form (enrolled students only) ── */}
      {isEnrolled && currentUser && (
        <div className={`rounded-2xl border-2 p-5 ${myReview && !isEditing ? "border-blue-100 bg-blue-50/30" : "border-slate-200"}`}>
          {myReview && !isEditing ? (
            // Show existing review with edit/delete
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-700">Your Review</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">You</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
              <StarDisplay rating={myReview.rating} size={16} />
              {myReview.comment && (
                <p className="text-sm text-slate-700 mt-2 leading-relaxed">{myReview.comment}</p>
              )}
              <p className="text-[10px] text-slate-400 mt-2">{new Date(myReview.updatedAt || myReview.createdAt).toLocaleDateString()}</p>
            </div>
          ) : (
            // Review form
            <form onSubmit={handleSubmit}>
              <h4 className="font-black text-slate-900 mb-3">
                {myReview ? "Edit Your Review" : "Leave a Review"}
              </h4>
              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-1.5 font-medium">Your Rating *</p>
                <StarPicker value={rating} onChange={setRating} disabled={submitting} />
              </div>
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-1.5 font-medium">Comment (optional)</p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this course..."
                  rows={3}
                  disabled={submitting}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition disabled:opacity-60"
                />
              </div>
              <div className="flex gap-2">
                {myReview && (
                  <button type="button" onClick={() => setIsEditing(false)}
                    className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={submitting || rating === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                  {submitting ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Prompt non-enrolled users */}
      {!isEnrolled && currentUser && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
          <MessageSquare size={20} className="text-amber-400 mx-auto mb-1" />
          <p className="text-sm text-amber-700 font-semibold">Enroll in this course to leave a review</p>
        </div>
      )}

      {/* ── Reviews list ── */}
      {reviews.length === 0 ? (
        <div className="text-center py-10">
          <Star size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="font-bold text-slate-500">No reviews yet</p>
          {isEnrolled && <p className="text-xs text-slate-400 mt-1">Be the first to review this course!</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const isOwn = r.userId === currentUser?.id || r.user?.id === currentUser?.id;
            return (
              <div key={r.id} className={`rounded-2xl p-4 border ${isOwn ? "border-blue-200 bg-blue-50/20" : "border-slate-100"}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-black text-sm shrink-0 overflow-hidden">
                    {r.user?.avatarUrl
                      ? <img src={r.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : r.user?.fullName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 text-sm">{r.user?.fullName}</p>
                      {isOwn && <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">You</span>}
                      <StarDisplay rating={r.rating} size={12} />
                    </div>
                    {r.comment && <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{r.comment}</p>}
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;


// ─────────────────────────────────────────────────────────────────────────────
// HOW TO USE IN CourseDetail.jsx
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Import at the top:
//    import ReviewSection from "../../components/ReviewSection";
//
// 2. In the Reviews tab content, replace whatever is there with:
//
//    {activeTab === "reviews" && (
//      <ReviewSection
//        courseId={course.id}
//        isEnrolled={isEnrolled}          // your existing boolean
//        currentUser={user}               // from useAuth()
//      />
//    )}
//
// ─────────────────────────────────────────────────────────────────────────────
// HOME.JSX — Show star rating on course cards
// ─────────────────────────────────────────────────────────────────────────────
//
// In your CourseCard component (or inline in Home.jsx), add this inside the
// card's rating row (the section that shows "4.8"):
//
//   {/* Replace the hardcoded 4.8 with real data: */}
//   <span className="flex items-center gap-1 text-amber-500 font-bold text-sm">
//     <Star size={13} fill="currentColor" />
//     {course.averageRating > 0 ? course.averageRating.toFixed(1) : "New"}
//     {course.totalReviews > 0 && (
//       <span className="text-slate-400 font-normal text-xs">({course.totalReviews})</span>
//     )}
//   </span>
//
// For this to work, your backend's GET /api/courses must include
// averageRating and totalReviews on each course object.
//
// Add this to your Prisma course query (courseController.js):
//
//   const courses = await prisma.course.findMany({
//     where: { status: "PUBLISHED" },
//     include: {
//       instructor: { select: { fullName: true } },
//       category:   true,
//       _count:     { select: { enrollments: true, lessons: true } },
//       reviews:    { select: { rating: true } },   // <-- ADD THIS
//     },
//   });
//
//   // Then map to add averageRating + totalReviews:
//   const withRatings = courses.map((c) => {
//     const total = c.reviews.length;
//     const avg   = total > 0
//       ? Math.round((c.reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
//       : 0;
//     const { reviews, ...rest } = c;   // strip raw reviews array
//     return { ...rest, averageRating: avg, totalReviews: total };
//   });
//
//   res.json(withRatings);
//
// ─────────────────────────────────────────────────────────────────────────────
