// src/pages/Profile.jsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../shared/Layout/Layout";
import { useAuth } from "../Context/AuthContext";
import {
  Camera, Save, Loader2, User, Mail, Phone, Award,
  Edit3, X, GraduationCap, Briefcase, Target, Shield,
  Eye, EyeOff, CheckCircle, Lock, Calendar, ExternalLink,
  LayoutDashboard, BookOpen, AlertCircle,
} from "lucide-react";
import API from "../services/api";

const INK    = "#22262B";
const BLUE   = "#1B3A5C";
const PAPER  = "#EEF1F3";
const LINE   = "#D8DEE3";
const MUTED  = "#5B6570";
const ORANGE = "#D65A2E";
const MOSS   = "#4C7A5C";
const RUST   = "#B23A2E";
const DISPLAY_FONT = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const MONO_FONT    = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";

const uploadToCloudinary = async (file) => {
  const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error("Cloudinary env vars missing");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error?.message || "Upload failed"); }
  return (await res.json()).secure_url;
};

const roleBadge = {
  ADMIN:      { label: "Administrator", color: RUST, icon: <Shield size={12} />,      },
  INSTRUCTOR: { label: "Instructor",    color: BLUE, icon: <Briefcase size={12} />,   },
  STUDENT:    { label: "Student",       color: MOSS, icon: <GraduationCap size={12} />, },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({ fullName: "", bio: "", phone: "", learningGoal: "", expertise: "", yearsExperience: "" });
  const [stats,          setStats]          = useState({ enrollments: 0, completed: 0, courses: 0 });
  const [saving,         setSaving]         = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError,    setAvatarError]    = useState("");
  const [toast,          setToast]          = useState(null);
  const [editMode,       setEditMode]       = useState(false);
  const [showPassForm,   setShowPassForm]   = useState(false);
  const [passForm,       setPassForm]       = useState({ current: "", next: "", confirm: "" });
  const [showPass,       setShowPass]       = useState({ current: false, next: false, confirm: false });
  const [savingPass,     setSavingPass]     = useState(false);

  const fileRef = useRef();

  useEffect(() => {
    if (!user) return;
    setForm({
      fullName:       user.fullName       || "",
      bio:            user.bio            || "",
      phone:          user.phone          || "",
      learningGoal:   user.learningGoal   || "",
      expertise:      user.expertise      || "",
      yearsExperience: user.yearsExperience || "",
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (user.role === "STUDENT") {
      API.get("/enrollments/my")
        .then((r) => {
          const list = Array.isArray(r.data) ? r.data : [];
          setStats((p) => ({
            ...p,
            enrollments: list.length,
            completed:   list.filter(e => e.progress === 100).length,
          }));
        })
        .catch(console.error);
    }
    if (user.role === "INSTRUCTOR") {
      API.get("/courses/instructor/my-courses")
        .then((r) => {
          const list = Array.isArray(r.data) ? r.data : [];
          setStats((p) => ({ ...p, courses: list.length }));
        })
        .catch(console.error);
    }
  }, [user]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Please select an image file", "error"); return; }
    if (file.size > 5 * 1024 * 1024)    { showToast("Image must be under 5MB", "error"); return; }

    setAvatarError("");
    setUploadingAvatar(true);
    try {
      const url = await uploadToCloudinary(file);
      await API.patch("/users/me", { avatarUrl: url });
      updateUser({ avatarUrl: url });
      showToast("Photo updated successfully!");
    } catch (err) {
      const msg = err.message || "Failed to upload photo";
      setAvatarError(msg);
      showToast(msg, "error");
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Only send fields that have actual values — strip empty strings
      const clean = (v) => (v && v.toString().trim() !== "" ? v : undefined);
      const payload = {
        fullName: clean(form.fullName),
        bio:      clean(form.bio),
        phone:    clean(form.phone),
        ...(user.role === "STUDENT"    ? { learningGoal:    clean(form.learningGoal) }                                              : {}),
        ...(user.role === "INSTRUCTOR" ? { expertise: clean(form.expertise), yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined } : {}),
      };
      await API.patch("/users/me", payload);
      updateUser(payload);
      setEditMode(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.next !== passForm.confirm) { showToast("New passwords don't match", "error"); return; }
    if (passForm.next.length < 6)          { showToast("Password must be at least 6 characters", "error"); return; }
    setSavingPass(true);
    try {
      await API.patch("/users/change-password", { currentPassword: passForm.current, newPassword: passForm.next });
      showToast("Password changed successfully!");
      setShowPassForm(false);
      setPassForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setSavingPass(false);
    }
  };

  if (!user) return null;

  const badge    = roleBadge[user.role] || roleBadge.STUDENT;
  const initials = user.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const fieldCls = "w-full border rounded-sm px-4 py-3 text-sm outline-none transition";
  const fieldStyle = { borderColor: LINE };

  return (
    <Layout>
      {toast && (
        <div className="fixed top-6 right-6 z-[999] flex items-center gap-2.5 px-5 py-4 rounded-sm text-white font-bold shadow-2xl text-sm border max-w-xs"
          style={{ backgroundColor: toast.type === "error" ? RUST : MOSS, borderColor: "rgba(255,255,255,0.2)" }}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen pt-20" style={{ backgroundColor: PAPER }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">

          {/* ── Profile Hero ── */}
          <div className="bg-white rounded-sm border overflow-hidden" style={{ borderColor: LINE }}>
            <div className="h-28 relative overflow-hidden" style={{ backgroundColor: "#12283D" }}>
              <div className="absolute inset-0 pointer-events-none opacity-[0.08]"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }} />
            </div>

            <div className="px-6 sm:px-8 pb-8">
              <div className="flex items-end justify-between -mt-14 mb-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-28 h-28 rounded-sm border-4 border-white shadow-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: BLUE }}>
                    {uploadingAvatar ? (
                      <Loader2 size={30} className="animate-spin text-white" />
                    ) : user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-black text-3xl" style={{ fontFamily: DISPLAY_FONT }}>{initials}</span>
                    )}
                  </div>
                  <button
                    onClick={() => { setAvatarError(""); fileRef.current?.click(); }}
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-sm flex items-center justify-center shadow-lg transition"
                    style={{ backgroundColor: ORANGE }}
                    title="Upload photo"
                  >
                    <Camera size={16} className="text-white" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-sm font-bold text-sm transition"
                  style={editMode
                    ? { backgroundColor: PAPER, color: INK, border: `1px solid ${LINE}` }
                    : { backgroundColor: ORANGE, color: "#fff" }}
                >
                  {editMode ? <><X size={15} /> Cancel</> : <><Edit3 size={15} /> Edit profile</>}
                </button>
              </div>

              {avatarError && (
                <p className="text-xs font-semibold mb-4 px-4 py-3 rounded-sm border flex items-center gap-2"
                  style={{ color: RUST, backgroundColor: "rgba(178,58,46,0.06)", borderColor: "rgba(178,58,46,0.25)" }}>
                  <AlertCircle size={14} /> {avatarError}
                </p>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>{user.fullName}</h1>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-sm border" style={{ color: badge.color, borderColor: `${badge.color}40` }}>
                    {badge.icon} {badge.label}
                  </span>
                  {user.isEmailVerified
                    ? <span className="inline-flex items-center gap-1 text-[10px] font-bold border px-2.5 py-1 rounded-sm" style={{ color: MOSS, borderColor: "rgba(76,122,93,0.35)", backgroundColor: "rgba(76,122,93,0.06)" }}>
                        <CheckCircle size={10} /> Verified
                      </span>
                    : <span className="inline-flex items-center gap-1 text-[10px] font-bold border px-2.5 py-1 rounded-sm" style={{ color: ORANGE, borderColor: "rgba(214,90,46,0.35)", backgroundColor: "rgba(214,90,46,0.06)" }}>
                        <AlertCircle size={10} /> Unverified
                      </span>
                  }
                </div>
                <p className="text-sm" style={{ color: MUTED }}>{user.email}</p>
                {user.createdAt && (
                  <p className="text-xs flex items-center gap-1.5" style={{ color: MUTED, fontFamily: MONO_FONT }}>
                    <Calendar size={11} /> Member since {fmtDate(user.createdAt)}
                  </p>
                )}
                {user.bio && !editMode && (
                  <p className="text-sm mt-3 leading-relaxed px-4 py-3 rounded-sm border" style={{ color: INK, backgroundColor: PAPER, borderColor: LINE }}>
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {user.role === "STUDENT" && (
              <>
                <div className="bg-white rounded-sm border p-5 text-center" style={{ borderColor: LINE }}>
                  <p className="text-3xl font-black" style={{ fontFamily: DISPLAY_FONT, color: BLUE }}>{stats.enrollments}</p>
                  <p className="text-xs font-bold mt-1.5 uppercase tracking-wider" style={{ color: MUTED, fontFamily: MONO_FONT }}>Enrolled</p>
                </div>
                <div className="bg-white rounded-sm border p-5 text-center" style={{ borderColor: LINE }}>
                  <p className="text-3xl font-black" style={{ fontFamily: DISPLAY_FONT, color: MOSS }}>{stats.completed}</p>
                  <p className="text-xs font-bold mt-1.5 uppercase tracking-wider" style={{ color: MUTED, fontFamily: MONO_FONT }}>Completed</p>
                </div>
                <Link to="/student-profile" className="col-span-2 rounded-sm p-5 text-white flex items-center justify-between transition group" style={{ backgroundColor: BLUE }}>
                  <div>
                    <p className="text-sm font-black">My learning profile</p>
                    <p className="text-[11px] mt-0.5 text-white/60">Achievements & certificates</p>
                  </div>
                  <ExternalLink size={16} className="opacity-70 group-hover:opacity-100 transition" />
                </Link>
              </>
            )}
            {user.role === "INSTRUCTOR" && (
              <>
                <div className="bg-white rounded-sm border p-5 text-center" style={{ borderColor: LINE }}>
                  <p className="text-3xl font-black" style={{ fontFamily: DISPLAY_FONT, color: BLUE }}>{stats.courses}</p>
                  <p className="text-xs font-bold mt-1.5 uppercase tracking-wider" style={{ color: MUTED, fontFamily: MONO_FONT }}>Courses</p>
                </div>
                <div className="bg-white rounded-sm border p-5 text-center" style={{ borderColor: LINE }}>
                  <p className="text-3xl font-black" style={{ fontFamily: DISPLAY_FONT, color: "#5B4A8C" }}>{user.yearsExperience || "—"}</p>
                  <p className="text-xs font-bold mt-1.5 uppercase tracking-wider" style={{ color: MUTED, fontFamily: MONO_FONT }}>Yrs exp</p>
                </div>
                <Link to="/instructordashboard"
                  className="rounded-sm p-5 text-white flex items-center justify-between transition group" style={{ backgroundColor: BLUE }}>
                  <div>
                    <p className="text-sm font-black">Dashboard</p>
                    <p className="text-[11px] mt-0.5 text-white/60">Manage courses</p>
                  </div>
                  <LayoutDashboard size={16} className="opacity-70 group-hover:opacity-100" />
                </Link>
                <Link to={`/instructors/${user.id}`}
                  className="bg-white border rounded-sm p-5 flex items-center justify-between transition group" style={{ borderColor: LINE, color: INK }}>
                  <div>
                    <p className="text-sm font-black">Public profile</p>
                    <p className="text-[11px] mt-0.5" style={{ color: MUTED }}>What students see</p>
                  </div>
                  <ExternalLink size={16} style={{ color: MUTED }} />
                </Link>
              </>
            )}
            {user.role === "ADMIN" && (
              <>
                <Link to="/admindashboard"
                  className="col-span-2 rounded-sm p-5 text-white flex items-center justify-between transition group" style={{ backgroundColor: RUST }}>
                  <div>
                    <p className="text-sm font-black flex items-center gap-2"><Shield size={14} /> Admin dashboard</p>
                    <p className="text-[11px] mt-0.5 text-white/70">Manage users, courses & payouts</p>
                  </div>
                  <LayoutDashboard size={16} className="opacity-70 group-hover:opacity-100" />
                </Link>
                <Link to="/admin/instructor-applications"
                  className="col-span-2 bg-white border rounded-sm p-5 flex items-center justify-between transition group" style={{ borderColor: LINE, color: INK }}>
                  <div>
                    <p className="text-sm font-black flex items-center gap-2"><GraduationCap size={14} /> Instructor applications</p>
                    <p className="text-[11px] mt-0.5" style={{ color: MUTED }}>Review pending applications</p>
                  </div>
                  <ExternalLink size={16} style={{ color: MUTED }} />
                </Link>
              </>
            )}
          </div>

          {/* ── Personal Information ── */}
          <div className="bg-white rounded-sm border p-6 sm:p-8" style={{ borderColor: LINE }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-sm flex items-center justify-center" style={{ backgroundColor: `${ORANGE}1A` }}>
                <User size={17} style={{ color: ORANGE }} />
              </div>
              <div>
                <h2 className="font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>Personal information</h2>
                <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                  {editMode ? "Update your profile details below" : "Your account details"}
                </p>
              </div>
            </div>

            {editMode ? (
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: MUTED, fontFamily: MONO_FONT }}>Full name *</label>
                    <input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} className={fieldCls} style={fieldStyle} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: MUTED, fontFamily: MONO_FONT }}>Phone</label>
                    <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+234 700 000 0000" className={fieldCls} style={fieldStyle} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: MUTED, fontFamily: MONO_FONT }}>Bio</label>
                  <textarea rows={3} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell others a bit about yourself…"
                    className={`${fieldCls} resize-none`} style={fieldStyle} />
                </div>
                {user.role === "STUDENT" && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: MUTED, fontFamily: MONO_FONT }}>Learning goal</label>
                    <input value={form.learningGoal} onChange={(e) => setForm((p) => ({ ...p, learningGoal: e.target.value }))}
                      placeholder="What do you want to achieve?" className={fieldCls} style={fieldStyle} />
                  </div>
                )}
                {user.role === "INSTRUCTOR" && (
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: MUTED, fontFamily: MONO_FONT }}>Expertise</label>
                      <input value={form.expertise} onChange={(e) => setForm((p) => ({ ...p, expertise: e.target.value }))}
                        placeholder="e.g. React, Node.js, Design" className={fieldCls} style={fieldStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: MUTED, fontFamily: MONO_FONT }}>Years of experience</label>
                      <input type="number" min="0" max="60" value={form.yearsExperience}
                        onChange={(e) => setForm((p) => ({ ...p, yearsExperience: e.target.value }))}
                        placeholder="e.g. 5" className={fieldCls} style={fieldStyle} />
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditMode(false)}
                    className="flex-1 border rounded-sm py-3 text-sm font-bold transition" style={{ borderColor: LINE, color: INK }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 disabled:opacity-50 text-white rounded-sm py-3 text-sm font-bold transition flex items-center justify-center gap-2"
                    style={{ backgroundColor: ORANGE }}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="divide-y" style={{ borderColor: LINE }}>
                {[
                  { icon: <User size={15} />,       label: "Full Name",         value: user.fullName },
                  { icon: <Mail size={15} />,       label: "Email",             value: user.email    },
                  { icon: <Phone size={15} />,      label: "Phone",             value: user.phone    },
                  { icon: <Calendar size={15} />,   label: "Member Since",      value: user.createdAt ? fmtDate(user.createdAt) : null },
                  ...(user.role === "STUDENT"    ? [{ icon: <Target size={15} />,   label: "Learning Goal", value: user.learningGoal }] : []),
                  ...(user.role === "INSTRUCTOR" ? [
                    { icon: <Briefcase size={15} />, label: "Expertise",     value: user.expertise },
                    { icon: <Award size={15} />,     label: "Experience",    value: user.yearsExperience ? `${user.yearsExperience} years` : null },
                  ] : []),
                ].filter(f => f.value).map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 py-4">
                    <span className="shrink-0" style={{ color: MUTED }}>{icon}</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED, fontFamily: MONO_FONT }}>{label}</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: INK }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Security / Change Password ── */}
          <div className="bg-white rounded-sm border p-6 sm:p-8" style={{ borderColor: LINE }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm flex items-center justify-center" style={{ backgroundColor: PAPER }}>
                  <Lock size={17} style={{ color: INK }} />
                </div>
                <div>
                  <h2 className="font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>Security</h2>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>Manage your password</p>
                </div>
              </div>
              <button
                onClick={() => { setShowPassForm(!showPassForm); setPassForm({ current: "", next: "", confirm: "" }); }}
                className="text-xs font-bold transition" style={{ color: ORANGE }}>
                {showPassForm ? "Cancel" : "Change password"}
              </button>
            </div>

            {showPassForm && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { key: "current", label: "Current Password"  },
                  { key: "next",    label: "New Password"       },
                  { key: "confirm", label: "Confirm New Password" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: MUTED, fontFamily: MONO_FONT }}>{label}</label>
                    <div className="relative">
                      <input
                        type={showPass[key] ? "text" : "password"}
                        value={passForm[key]}
                        onChange={(e) => setPassForm((p) => ({ ...p, [key]: e.target.value }))}
                        className={`${fieldCls} pr-10`} style={fieldStyle}
                        required
                      />
                      <button type="button" onClick={() => setShowPass((p) => ({ ...p, [key]: !p[key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition" style={{ color: MUTED }}>
                        {showPass[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
                {/* Live confirm match */}
                {passForm.confirm.length > 0 && (
                  <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: passForm.next === passForm.confirm ? MOSS : "#D4695C" }}>
                    {passForm.next === passForm.confirm ? <CheckCircle size={12} /> : <X size={12} />}
                    {passForm.next === passForm.confirm ? "Passwords match" : "Passwords don't match"}
                  </p>
                )}
                <button type="submit" disabled={savingPass}
                  className="w-full disabled:opacity-60 text-white rounded-sm py-3 text-sm font-bold transition flex items-center justify-center gap-2 mt-2"
                  style={{ backgroundColor: "#12283D" }}>
                  {savingPass ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                  {savingPass ? "Updating…" : "Update password"}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Profile;