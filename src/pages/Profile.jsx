import { useState, useRef, useEffect } from "react";
import Layout from "../shared/Layout/Layout";
import { useAuth } from "../Context/AuthContext";
import {
  Camera, Save, Loader2, User, Mail, Phone, Award,
  Edit3, X, GraduationCap, Briefcase, Target, Shield,
  Eye, EyeOff, CheckCircle, Lock,
} from "lucide-react";
import API from "../services/api";

const uploadToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary env vars missing");
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Upload failed");
  }
  return (await res.json()).secure_url;
};

const roleBadge = {
  ADMIN: {
    label: "Administrator",
    bg: "bg-red-100/80 text-red-700 border-red-200",
    icon: <Shield size={12} />,
    color: "red",
  },
  INSTRUCTOR: {
    label: "Instructor",
    bg: "bg-blue-100/80 text-blue-700 border-blue-200",
    icon: <Briefcase size={12} />,
    color: "blue",
  },
  STUDENT: {
    label: "Student",
    bg: "bg-emerald-100/80 text-emerald-700 border-emerald-200",
    icon: <GraduationCap size={12} />,
    color: "emerald",
  },
};

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    phone: "",
    learningGoal: "",
    expertise: "",
    yearsExperience: "",
  });
  const [stats, setStats] = useState({ enrollments: 0, courses: 0 });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [toast, setToast] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);
  const [passForm, setPassForm] = useState({ current: "", next: "", confirm: "" });
  const [showPass, setShowPass] = useState({ current: false, next: false, confirm: false });
  const [savingPass, setSavingPass] = useState(false);

  const fileRef = useRef();

  useEffect(() => {
    if (!user) return;
    setForm({
      fullName: user.fullName || "",
      bio: user.bio || "",
      phone: user.phone || "",
      learningGoal: user.learningGoal || "",
      expertise: user.expertise || "",
      yearsExperience: user.yearsExperience || "",
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (user.role === "STUDENT") {
      API.get("/enrollments/my")
        .then((r) => {
          const list = Array.isArray(r.data) ? r.data : [];
          setStats((p) => ({ ...p, enrollments: list.length }));
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

    setAvatarError("");
    setUploadingAvatar(true);
    try {
      const url = await uploadToCloudinary(file);
      await API.patch("/users/me", { avatarUrl: url });
      updateUser({ avatarUrl: url });
      showToast("Avatar updated successfully!");
    } catch (err) {
      const msg = err.message || "Failed to upload avatar";
      setAvatarError(msg);
      showToast(msg, "error");
      console.error("Avatar upload error:", err);
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName || undefined,
        bio: form.bio || undefined,
        phone: form.phone || undefined,
        ...(user.role === "STUDENT" ? { learningGoal: form.learningGoal || undefined } : {}),
        ...(user.role === "INSTRUCTOR"
          ? {
              expertise: form.expertise || undefined,
              yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
            }
          : {}),
      };
      await API.patch("/users/me", payload);
      updateUser(payload);
      setEditMode(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.next !== passForm.confirm) {
      showToast("New passwords don't match", "error");
      return;
    }
    if (passForm.next.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    setSavingPass(true);
    try {
      await API.patch("/users/change-password", {
        currentPassword: passForm.current,
        newPassword: passForm.next,
      });
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

  const badge = roleBadge[user.role] || roleBadge.STUDENT;
  const initials = user.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
          {/* Profile Hero */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              </div>
            </div>

            <div className="px-8 pb-8">
              <div className="flex items-end justify-between -mt-16 mb-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center relative">
                    {uploadingAvatar ? (
                      <Loader2 size={32} className="animate-spin text-white" />
                    ) : user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-black text-3xl">{initials}</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setAvatarError("");
                      fileRef.current?.click();
                    }}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 hover:bg-amber-600 rounded-xl flex items-center justify-center shadow-lg transition transform group-hover:scale-110"
                    title="Upload avatar"
                  >
                    <Camera size={16} className="text-white" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition ${
                    editMode
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-600/20"
                  }`}
                >
                  {editMode ? (
                    <>
                      <X size={16} /> Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 size={16} /> Edit Profile
                    </>
                  )}
                </button>
              </div>

              {avatarError && (
                <p className="text-xs text-red-500 font-semibold mb-4 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                  {avatarError}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-black text-slate-900">{user.fullName}</h1>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${badge.bg}`}>
                    {badge.icon} {badge.label}
                  </span>
                </div>
                <p className="text-slate-500 text-sm">{user.email}</p>
                {user.bio && !editMode && (
                  <p className="text-slate-700 text-sm mt-3 leading-relaxed bg-slate-50 px-4 py-3 rounded-xl">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {user.role === "STUDENT" && (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm hover:shadow-md transition">
                  <p className="text-3xl font-black text-blue-600">{stats.enrollments}</p>
                  <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-wider">
                    Enrolled Courses
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm hover:shadow-md transition">
                  <p className="text-3xl font-black text-amber-500">🏆</p>
                  <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-wider">
                    Certificates
                  </p>
                </div>
              </>
            )}
            {user.role === "INSTRUCTOR" && (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm hover:shadow-md transition">
                  <p className="text-3xl font-black text-blue-600">{stats.courses}</p>
                  <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-wider">
                    Courses Created
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm hover:shadow-md transition">
                  <p className="text-3xl font-black text-violet-600">{user.yearsExperience || "—"}</p>
                  <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-wider">
                    Years Experience
                  </p>
                </div>
              </>
            )}
            {user.role === "ADMIN" && (
              <div className="col-span-2 sm:col-span-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="font-black text-red-700 text-sm">Administrator Account</p>
                  <p className="text-xs text-red-600 mt-0.5">Full platform access and management rights</p>
                </div>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <User size={18} className="text-amber-600" />
              </div>
              <div>
                <h2 className="font-black text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editMode ? "Update your profile details" : "Your profile information"}
                </p>
              </div>
            </div>

            {editMode ? (
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      value={form.fullName}
                      onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Phone
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 234 567 8900"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell others a bit about yourself..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none transition"
                  />
                </div>

                {user.role === "STUDENT" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Learning Goal
                    </label>
                    <input
                      value={form.learningGoal}
                      onChange={(e) => setForm((p) => ({ ...p, learningGoal: e.target.value }))}
                      placeholder="What do you want to achieve?"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    />
                  </div>
                )}

                {user.role === "INSTRUCTOR" && (
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                        Expertise
                      </label>
                      <input
                        value={form.expertise}
                        onChange={(e) => setForm((p) => ({ ...p, expertise: e.target.value }))}
                        placeholder="e.g. React, Node.js"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.yearsExperience}
                        onChange={(e) => setForm((p) => ({ ...p, yearsExperience: e.target.value }))}
                        placeholder="e.g. 5"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-0">
                {[
                  { icon: <User size={16} />, label: "Full Name", value: user.fullName },
                  { icon: <Mail size={16} />, label: "Email", value: user.email },
                  { icon: <Phone size={16} />, label: "Phone", value: user.phone },
                  ...(user.role === "STUDENT" ? [{ icon: <Target size={16} />, label: "Learning Goal", value: user.learningGoal }] : []),
                  ...(user.role === "INSTRUCTOR"
                    ? [
                        { icon: <Briefcase size={16} />, label: "Expertise", value: user.expertise },
                        {
                          icon: <Award size={16} />,
                          label: "Years Experience",
                          value: user.yearsExperience ? `${user.yearsExperience} years` : null,
                        },
                      ]
                    : []),
                ].filter((f) => f.value).map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
                    <span className="text-slate-400 shrink-0">{icon}</span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                      <p className="text-sm text-slate-800 font-semibold mt-1">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Lock size={18} className="text-slate-700" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900">Security</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Keep your account secure</p>
                </div>
              </div>
              <button
                onClick={() => setShowPassForm(!showPassForm)}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 transition"
              >
                {showPassForm ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showPassForm && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { key: "current", label: "Current Password" },
                  { key: "next", label: "New Password" },
                  { key: "confirm", label: "Confirm Password" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      {label}
                    </label>
                    <div className="relative">
                      <input
                        type={showPass[key] ? "text" : "password"}
                        value={passForm[key]}
                        onChange={(e) => setPassForm((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10 transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => ({ ...p, [key]: !p[key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPass[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={savingPass}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2 mt-4"
                >
                  {savingPass ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                  {savingPass ? "Updating..." : "Update Password"}
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
