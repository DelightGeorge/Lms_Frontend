// src/components/LessonComments.jsx
// Drop-in comments section for any lesson.
// Usage: <LessonComments lessonId={lesson.id} courseInstructorId={course.instructorId} />
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import API from "../services/api";
import {
  MessageCircle, Send, ThumbsUp, Reply, Trash2,
  Edit3, Check, X, Loader2, ChevronDown, ChevronUp,
  ShieldCheck, GraduationCap,
} from "lucide-react";

// ── helpers ────────────────────────────────────────────────────────────────
const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const Avatar = ({ user, size = 8 }) => (
  <div className={`w-${size} h-${size} rounded-full shrink-0 overflow-hidden flex items-center justify-center font-black text-white bg-gradient-to-br from-blue-500 to-indigo-600 text-sm`}
    style={{ minWidth: `${size * 4}px`, height: `${size * 4}px` }}>
    {user?.avatarUrl
      ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
      : <span>{user?.fullName?.[0] ?? "?"}</span>}
  </div>
);

const RoleBadge = ({ role }) => {
  if (role === "ADMIN") return (
    <span className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wide text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
      <ShieldCheck size={9} /> Admin
    </span>
  );
  if (role === "INSTRUCTOR") return (
    <span className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wide text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
      <GraduationCap size={9} /> Instructor
    </span>
  );
  return null;
};

// ── Single comment ──────────────────────────────────────────────────────────
const Comment = ({
  comment, currentUser, courseInstructorId,
  onDelete, onEdit, onLike, onReply,
  depth = 0,
}) => {
  const [editing, setEditing]       = useState(false);
  const [editText, setEditText]     = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);
  const [replying, setReplying]     = useState(false);
  const [replyText, setReplyText]   = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [liked, setLiked]           = useState(
    Array.isArray(comment.likes) && comment.likes.length > 0
  );
  const [likeCount, setLikeCount]   = useState(comment._count?.likes ?? 0);

  const isOwner     = currentUser?.id === comment.user?.id;
  const isInstructor = comment.user?.id === courseInstructorId;
  const replyCount  = comment.replies?.length ?? comment._count?.replies ?? 0;

  const handleSaveEdit = async () => {
    if (!editText.trim() || editText === comment.content) { setEditing(false); return; }
    setSavingEdit(true);
    await onEdit(comment.id, editText.trim());
    setSavingEdit(false);
    setEditing(false);
  };

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    await onLike(comment.id);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    await onReply(replyText.trim(), comment.id);
    setReplyText("");
    setReplying(false);
    setSubmittingReply(false);
  };

  return (
    <div className={`flex gap-3 ${depth > 0 ? "ml-10 pl-4 border-l-2 border-slate-100" : ""}`}>
      <Avatar user={comment.user} size={depth > 0 ? 7 : 8} />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-black text-slate-900">{comment.user?.fullName}</span>
          <RoleBadge role={comment.user?.role} />
          {isInstructor && comment.user?.role === "INSTRUCTOR" && (
            <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Course Instructor</span>
          )}
          <span className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</span>
          {comment.isEdited && <span className="text-[9px] text-slate-400 italic">(edited)</span>}
        </div>

        {/* Body */}
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              maxLength={2000}
              autoFocus
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition bg-slate-50"
            />
            <div className="flex items-center gap-2">
              <button onClick={handleSaveEdit} disabled={savingEdit}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-60">
                {savingEdit ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Save
              </button>
              <button onClick={() => { setEditing(false); setEditText(comment.content); }}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition">
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
        )}

        {/* Actions */}
        {!editing && (
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {currentUser && (
              <button onClick={handleLike}
                className={`flex items-center gap-1 text-xs font-semibold transition ${liked ? "text-blue-600" : "text-slate-400 hover:text-blue-500"}`}>
                <ThumbsUp size={13} className={liked ? "fill-blue-600" : ""} />
                {likeCount > 0 && likeCount}
              </button>
            )}
            {currentUser && depth === 0 && (
              <button onClick={() => setReplying(!replying)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-blue-500 transition">
                <Reply size={13} /> Reply
              </button>
            )}
            {isOwner && (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 transition">
                <Edit3 size={12} /> Edit
              </button>
            )}
            {(isOwner || currentUser?.role === "ADMIN") && (
              <button onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-500 transition">
                <Trash2 size={12} /> Delete
              </button>
            )}
            {replyCount > 0 && depth === 0 && (
              <button onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700 ml-1 transition">
                {showReplies ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {replyCount} {replyCount === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>
        )}

        {/* Reply form */}
        {replying && (
          <div className="mt-3 flex items-start gap-2">
            <Avatar user={currentUser} size={7} />
            <div className="flex-1 flex items-end gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.user?.fullName}…`}
                rows={2}
                maxLength={2000}
                autoFocus
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition bg-slate-50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmitReply();
                  if (e.key === "Escape") setReplying(false);
                }}
              />
              <button onClick={handleSubmitReply} disabled={submittingReply || !replyText.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition shrink-0">
                {submittingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {showReplies && comment.replies?.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                courseInstructorId={courseInstructorId}
                onDelete={onDelete}
                onEdit={onEdit}
                onLike={onLike}
                onReply={onReply}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main export ─────────────────────────────────────────────────────────────
export default function LessonComments({ lessonId, courseInstructorId }) {
  const { user }         = useAuth();
  const [comments, setComments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [text, setText]             = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const textRef = useRef(null);

  const load = () => {
    if (!lessonId) return;
    setLoading(true);
    API.get(`/lesson-comments/${lessonId}`)
      .then((r) => setComments(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [lessonId]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const r = await API.post("/lesson-comments", { lessonId, content: text.trim() });
      setComments((prev) => [r.data.comment, ...prev]);
      setText("");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/lesson-comments/${id}`);
      // Remove from top-level or from replies
      setComments((prev) => {
        const withoutTop = prev.filter((c) => c.id !== id);
        return withoutTop.map((c) => ({
          ...c,
          replies: (c.replies || []).filter((r) => r.id !== id),
        }));
      });
    } catch {}
  };

  const handleEdit = async (id, content) => {
    try {
      const r = await API.patch(`/lesson-comments/${id}`, { content });
      const updated = r.data.comment;
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === id) return { ...c, ...updated };
          return { ...c, replies: (c.replies || []).map((r) => r.id === id ? { ...r, ...updated } : r) };
        })
      );
    } catch {}
  };

  const handleLike = async (id) => {
    try { await API.post(`/lesson-comments/${id}/like`); } catch {}
  };

  const handleReply = async (content, parentId) => {
    try {
      const r = await API.post("/lesson-comments", { lessonId, content, parentId });
      const reply = r.data.comment;
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), reply], _count: { ...c._count, replies: (c._count?.replies ?? 0) + 1 } }
            : c
        )
      );
    } catch {}
  };

  const totalCount = comments.reduce((a, c) => a + 1 + (c.replies?.length ?? 0), 0);

  return (
    <div className="mt-10 border-t border-slate-800 pt-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={18} className="text-blue-400" />
        <h3 className="text-base font-black text-white">
          Discussion
          {totalCount > 0 && (
            <span className="ml-2 text-sm font-bold text-slate-400">({totalCount})</span>
          )}
        </h3>
      </div>

      {/* Compose box */}
      {user ? (
        <div className="flex items-start gap-3 mb-8">
          <Avatar user={user} />
          <div className="flex-1">
            <textarea
              ref={textRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask a question or share a thought about this lesson…"
              rows={3}
              maxLength={2000}
              className="w-full bg-slate-800/60 border border-slate-700 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
              }}
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-slate-500">Ctrl + Enter to post</p>
              <button
                onClick={handleSubmit}
                disabled={submitting || !text.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition"
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Post
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 bg-slate-800/40 border border-slate-700 rounded-2xl p-5 text-center">
          <p className="text-sm text-slate-400 mb-3">
            <Link to="/auth" className="text-blue-400 hover:text-blue-300 font-bold underline">Sign in</Link>
            {" "}to join the discussion
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={28} className="animate-spin text-slate-600" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <MessageCircle size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-semibold">No discussion yet</p>
          <p className="text-slate-600 text-xs mt-1">Be the first to ask a question or share thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5">
              <Comment
                comment={comment}
                currentUser={user}
                courseInstructorId={courseInstructorId}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onLike={handleLike}
                onReply={handleReply}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
