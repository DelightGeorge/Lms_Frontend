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
  ADMIN:      { label: "Administrator", bg: "bg-red-100/80 text-red-700 border-red-200",        icon: <Shield size={12} />,      color: "red"     },
  INSTRUCTOR: { label: "Instructor",    bg: "bg-blue-100/80 text-blue-700 border-blue-200",      icon: <Briefcase size={12} />,   color: "blue"    },
  STUDENT:    { label: "Student",       bg: "bg-emerald-100/80 text-emerald-700 border-emerald-200", icon: <GraduationCap size={12} />, color: "emerald" },
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

  const fieldCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition";

  return (
    <Layout>
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] flex items-center gap-2.5 px-5 py-4 rounded-xl text-white font-bold shadow-2xl text-sm backdrop-blur-xl border max-w-xs
          ${toast.type === "error" ? "bg-red-500/90 border-red-400/50" : "bg-emerald-500/90 border-emerald-400/50"}`}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">

          {/* ── Profile Hero ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              </div>
            </div>

            <div className="px-6 sm:px-8 pb-8">
              <div className="flex items-end justify-between -mt-16 mb-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    {uploadingAvatar ? (
                      <Loader2 size={32} className="animate-spin text-white" />
                    ) : user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-black text-3xl">{initials}</span>
                    )}
                  </div>
                  <button
                    onClick={() => { setAvatarError(""); fileRef.current?.click(); }}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 hover:bg-amber-600 rounded-xl flex items-center justify-center shadow-lg transition transform group-hover:scale-110"
                    title="Upload photo"
                  >
                    <Camera size={16} className="text-white" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
                    editMode
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-600/20"
                  }`}
                >
                  {editMode ? <><X size={15} /> Cancel</> : <><Edit3 size={15} /> Edit Profile</>}
                </button>
              </div>

              {avatarError && (
                <p className="text-xs text-red-500 font-semibold mb-4 bg-red-50 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
                  <AlertCircle size={14} /> {avatarError}
                </p>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{user.fullName}</h1>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${badge.bg}`}>
                    {badge.icon} {badge.label}
                  </span>
                  {user.isEmailVerified
                    ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        <CheckCircle size={10} /> Verified
                      </span>
                    : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        <AlertCircle size={10} /> Unverified
                      </span>
                  }
                </div>
                <p className="text-slate-500 text-sm">{user.email}</p>
                {user.createdAt && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar size={11} /> Member since {fmtDate(user.createdAt)}
                  </p>
                )}
                {user.bio && !editMode && (
                  <p className="text-slate-700 text-sm mt-3 leading-relaxed bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
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
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm hover:shadow-md transition">
                  <p className="text-3xl font-black text-blue-600">{stats.enrollments}</p>
                  <p className="text-xs text-slate-500 font-bold mt-1.5 uppercase tracking-wider">Enrolled</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm hover:shadow-md transition">
                  <p className="text-3xl font-black text-emerald-600">{stats.completed}</p>
                  <p className="text-xs text-slate-500 font-bold mt-1.5 uppercase tracking-wider">Completed</p>
                </div>
                <Link to="/student-profile" className="col-span-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-2xl p-5 text-white flex items-center justify-between shadow-sm hover:shadow-md transition group">
                  <div>
                    <p className="text-sm font-black">My Learning Profile</p>
                    <p className="text-[11px] text-blue-200 mt-0.5">Achievements & certificates</p>
                  </div>
                  <ExternalLink size={16} className="opacity-70 group-hover:opacity-100 transition" />
                </Link>
              </>
            )}
            {user.role === "INSTRUCTOR" && (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm hover:shadow-md transition">
                  <p className="text-3xl font-black text-blue-600">{stats.courses}</p>
                  <p className="text-xs text-slate-500 font-bold mt-1.5 uppercase tracking-wider">Courses</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm hover:shadow-md transition">
                  <p className="text-3xl font-black text-violet-600">{user.yearsExperience || "—"}</p>
                  <p className="text-xs text-slate-500 font-bold mt-1.5 uppercase tracking-wider">Yrs Exp</p>
                </div>
                <Link to="/instructordashboard"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-2xl p-5 text-white flex items-center justify-between shadow-sm hover:shadow-md transition group">
                  <div>
                    <p className="text-sm font-black">Dashboard</p>
                    <p className="text-[11px] text-blue-200 mt-0.5">Manage courses</p>
                  </div>
                  <LayoutDashboard size={16} className="opacity-70 group-hover:opacity-100" />
                </Link>
                <Link to={`/instructors/${user.id}`}
                  className="bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-700 flex items-center justify-between shadow-sm hover:shadow-md transition group">
                  <div>
                    <p className="text-sm font-black">Public Profile</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">What students see</p>
                  </div>
                  <ExternalLink size={16} className="text-slate-300 group-hover:text-slate-600" />
                </Link>
              </>
            )}
            {user.role === "ADMIN" && (
              <>
                <Link to="/admindashboard"
                  className="col-span-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 rounded-2xl p-5 text-white flex items-center justify-between shadow-sm hover:shadow-md transition group">
                  <div>
                    <p className="text-sm font-black flex items-center gap-2"><Shield size={14} /> Admin Dashboard</p>
                    <p className="text-[11px] text-red-200 mt-0.5">Manage users, courses & payouts</p>
                  </div>
                  <LayoutDashboard size={16} className="opacity-70 group-hover:opacity-100" />
                </Link>
                <Link to="/admin/instructor-applications"
                  className="col-span-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-700 flex items-center justify-between shadow-sm hover:shadow-md transition group">
                  <div>
                    <p className="text-sm font-black flex items-center gap-2"><GraduationCap size={14} /> Instructor Applications</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Review pending applications</p>
                  </div>
                  <ExternalLink size={16} className="text-slate-300 group-hover:text-slate-600" />
                </Link>
              </>
            )}
          </div>

          {/* ── Personal Information ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <User size={18} className="text-amber-600" />
              </div>
              <div>
                <h2 className="font-black text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editMode ? "Update your profile details below" : "Your account details"}
                </p>
              </div>
            </div>

            {editMode ? (
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Full Name *</label>
                    <input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} className={fieldCls} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Phone</label>
                    <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+234 700 000 0000" className={fieldCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Bio</label>
                  <textarea rows={3} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell others a bit about yourself…"
                    className={`${fieldCls} resize-none`} />
                </div>
                {user.role === "STUDENT" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Learning Goal</label>
                    <input value={form.learningGoal} onChange={(e) => setForm((p) => ({ ...p, learningGoal: e.target.value }))}
                      placeholder="What do you want to achieve?" className={fieldCls} />
                  </div>
                )}
                {user.role === "INSTRUCTOR" && (
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Expertise</label>
                      <input value={form.expertise} onChange={(e) => setForm((p) => ({ ...p, expertise: e.target.value }))}
                        placeholder="e.g. React, Node.js, Design" className={fieldCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Years of Experience</label>
                      <input type="number" min="0" max="60" value={form.yearsExperience}
                        onChange={(e) => setForm((p) => ({ ...p, yearsExperience: e.target.value }))}
                        placeholder="e.g. 5" className={fieldCls} />
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditMode(false)}
                    className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="divide-y divide-slate-100">
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
                    <span className="text-slate-400 shrink-0">{icon}</span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                      <p className="text-sm text-slate-800 font-semibold mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Security / Change Password ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Lock size={18} className="text-slate-700" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900">Security</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage your password</p>
                </div>
              </div>
              <button
                onClick={() => { setShowPassForm(!showPassForm); setPassForm({ current: "", next: "", confirm: "" }); }}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 transition">
                {showPassForm ? "Cancel" : "Change Password"}
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
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">{label}</label>
                    <div className="relative">
                      <input
                        type={showPass[key] ? "text" : "password"}
                        value={passForm[key]}
                        onChange={(e) => setPassForm((p) => ({ ...p, [key]: e.target.value }))}
                        className={`${fieldCls} pr-10`}
                        required
                      />
                      <button type="button" onClick={() => setShowPass((p) => ({ ...p, [key]: !p[key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                        {showPass[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
                {/* Live confirm match */}
                {passForm.confirm.length > 0 && (
                  <p className={`text-xs font-bold flex items-center gap-1.5 ${passForm.next === passForm.confirm ? "text-emerald-600" : "text-red-500"}`}>
                    {passForm.next === passForm.confirm ? <CheckCircle size={12} /> : <X size={12} />}
                    {passForm.next === passForm.confirm ? "Passwords match" : "Passwords don't match"}
                  </p>
                )}
                <button type="submit" disabled={savingPass}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2 mt-2">
                  {savingPass ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                  {savingPass ? "Updating…" : "Update Password"}
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