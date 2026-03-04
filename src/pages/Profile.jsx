import { useState, useRef, useEffect } from "react";
import Layout from "../../shared/Layout/Layout";
import { useAuth } from "../../Context/AuthContext";
import {
  Camera, Save, Loader2, CheckCircle, User,
  Mail, Phone, BookOpen, Award, Edit3, X,
  GraduationCap, Briefcase, Target, Shield,
  Eye, EyeOff,
} from "lucide-react";
import API from "../../services/api";

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST", body: fd,
  });
  if (!res.ok) throw new Error("Upload failed");
  return (await res.json()).secure_url;
};

const roleBadge = {
  ADMIN:      { label: "Admin",      bg: "bg-red-100 text-red-600 border-red-200",         icon: <Shield size={11} />       },
  INSTRUCTOR: { label: "Instructor", bg: "bg-blue-100 text-blue-600 border-blue-200",       icon: <Briefcase size={11} />    },
  STUDENT:    { label: "Student",    bg: "bg-emerald-100 text-emerald-600 border-emerald-200", icon: <GraduationCap size={11} /> },
};

const Profile = () => {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    fullName:       "",
    bio:            "",
    phone:          "",
    learningGoal:   "",
    expertise:      "",
    yearsExperience:"",
  });

  const [stats,          setStats]          = useState({ enrollments: 0, completed: 0, courses: 0 });
  const [saving,         setSaving]         = useState(false);
  const [uploadingAvatar,setUploadingAvatar]= useState(false);
  const [toast,          setToast]          = useState(null);
  const [editMode,       setEditMode]       = useState(false);
  const [avatarPreview,  setAvatarPreview]  = useState("");
  const [showPassForm,   setShowPassForm]   = useState(false);
  const [passForm,       setPassForm]       = useState({ current: "", next: "", confirm: "" });
  const [showPass,       setShowPass]       = useState({ current: false, next: false, confirm: false });
  const [savingPass,     setSavingPass]     = useState(false);

  const fileRef = useRef();

  // Load user into form
  useEffect(() => {
    if (!user) return;
    setForm({
      fullName:        user.fullName        || "",
      bio:             user.bio             || "",
      phone:           user.phone           || "",
      learningGoal:    user.learningGoal    || "",
      expertise:       user.expertise       || "",
      yearsExperience: user.yearsExperience || "",
    });
    setAvatarPreview(user.avatarUrl || "");
  }, [user]);

  // Fetch stats
  useEffect(() => {
    if (!user) return;
    if (user.role === "STUDENT") {
      API.get("/enrollments/my")
        .then((r) => {
          const enrollments = Array.isArray(r.data) ? r.data : [];
          setStats((p) => ({ ...p, enrollments: enrollments.length }));
        })
        .catch(console.error);
    }
    if (user.role === "INSTRUCTOR") {
      API.get("/courses/instructor/my-courses")
        .then((r) => {
          const courses = Array.isArray(r.data) ? r.data : [];
          setStats((p) => ({ ...p, courses: courses.length }));
        })
        .catch(console.error);
    }
  }, [user]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadToCloudinary(file);
      setAvatarPreview(url);
      // Immediately save avatar
      const res = await API.patch("/users/profile", { avatarUrl: url });
      if (setUser) setUser((p) => ({ ...p, avatarUrl: url }));
      showToast("Avatar updated!");
    } catch {
      showToast("Failed to upload avatar", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName:  form.fullName,
        bio:       form.bio       || undefined,
        phone:     form.phone     || undefined,
        ...(user.role === "STUDENT"    ? { learningGoal: form.learningGoal || undefined } : {}),
        ...(user.role === "INSTRUCTOR" ? {
          expertise:       form.expertise       || undefined,
          yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
        } : {}),
      };
      const res = await API.patch("/users/me", payload);
      if (setUser) setUser((p) => ({ ...p, ...payload }));
      setEditMode(false);
      showToast("Profile saved!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.next !== passForm.confirm) {
      showToast("New passwords don't match", "error"); return;
    }
    if (passForm.next.length < 6) {
      showToast("Password must be at least 6 characters", "error"); return;
    }
    setSavingPass(true);
    try {
      await API.patch("/users/change-password", {
        currentPassword: passForm.current,
        newPassword:     passForm.next,
      });
      showToast("Password changed!");
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

  const initials = user.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Layout>
      {toast && (
        <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-2xl text-white font-bold shadow-2xl text-sm
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pt-28 space-y-6">

          {/* ── Profile hero card ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Cover */}
            <div className="h-28 bg-gradient-to-r from-blue-600 via-blue-700 to-violet-700 relative">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
            </div>

            <div className="px-6 pb-6">
              {/* Avatar row */}
              <div className="flex items-end justify-between -mt-12 mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    {uploadingAvatar ? (
                      <Loader2 size={28} className="animate-spin text-white" />
                    ) : avatarPreview ? (
                      <img src={avatarPreview} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-black text-2xl">{initials}</span>
                    )}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center shadow-md transition"
                  >
                    <Camera size={14} className="text-white" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition
                    ${editMode
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {editMode ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit Profile</>}
                </button>
              </div>

              {/* Name & badge */}
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-black text-slate-900">{user.fullName}</h1>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border ${badge.bg}`}>
                    {badge.icon} {badge.label}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{user.email}</p>
                {user.bio && !editMode && (
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">{user.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {user.role === "STUDENT" && (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                  <p className="text-2xl font-black text-blue-600">{stats.enrollments}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Enrolled Courses</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                  <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Completed</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                  <p className="text-2xl font-black text-amber-500">🏆</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Certificates</p>
                </div>
              </>
            )}
            {user.role === "INSTRUCTOR" && (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                  <p className="text-2xl font-black text-blue-600">{stats.courses}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Courses Created</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                  <p className="text-2xl font-black text-violet-600">{user.yearsExperience || "—"}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Years Experience</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                  <p className="text-2xl font-black text-emerald-600 truncate text-base pt-1">{user.expertise || "—"}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Expertise</p>
                </div>
              </>
            )}
            {user.role === "ADMIN" && (
              <div className="col-span-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                <Shield size={20} className="text-red-500 shrink-0" />
                <div>
                  <p className="font-black text-red-700 text-sm">Administrator Account</p>
                  <p className="text-xs text-red-400">Full platform access and management</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Edit / View form ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-black text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-400">{editMode ? "Edit your details below" : "Your profile information"}</p>
              </div>
            </div>

            {editMode ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Full Name *</label>
                    <input
                      value={form.fullName}
                      onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 234 567 8900"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Bio</label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell others a bit about yourself..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                  />
                </div>

                {user.role === "STUDENT" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Learning Goal</label>
                    <input
                      value={form.learningGoal}
                      onChange={(e) => setForm((p) => ({ ...p, learningGoal: e.target.value }))}
                      placeholder="What do you want to achieve?"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                )}

                {user.role === "INSTRUCTOR" && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Expertise</label>
                      <input
                        value={form.expertise}
                        onChange={(e) => setForm((p) => ({ ...p, expertise: e.target.value }))}
                        placeholder="e.g. React, Node.js, Python"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Years of Experience</label>
                      <input
                        type="number" min="0"
                        value={form.yearsExperience}
                        onChange={(e) => setForm((p) => ({ ...p, yearsExperience: e.target.value }))}
                        placeholder="e.g. 5"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditMode(false)}
                    className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-bold transition flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {[
                  { icon: <User size={14} />,   label: "Full Name",  value: user.fullName },
                  { icon: <Mail size={14} />,   label: "Email",      value: user.email    },
                  { icon: <Phone size={14} />,  label: "Phone",      value: user.phone    },
                  ...(user.role === "STUDENT" ? [
                    { icon: <Target size={14} />,   label: "Learning Goal", value: user.learningGoal },
                  ] : []),
                  ...(user.role === "INSTRUCTOR" ? [
                    { icon: <Briefcase size={14} />, label: "Expertise",          value: user.expertise },
                    { icon: <Award size={14} />,     label: "Years Experience",    value: user.yearsExperience ? `${user.yearsExperience} years` : null },
                  ] : []),
                ].map(({ icon, label, value }) => value ? (
                  <div key={label} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-400 shrink-0">{icon}</span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                      <p className="text-sm text-slate-700 font-semibold">{value}</p>
                    </div>
                  </div>
                ) : null)}
              </div>
            )}
          </div>

          {/* ── Change Password ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Shield size={16} className="text-slate-600" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900">Password</h2>
                  <p className="text-xs text-slate-400">Keep your account secure</p>
                </div>
              </div>
              <button
                onClick={() => setShowPassForm(!showPassForm)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
              >
                {showPassForm ? "Cancel" : "Change"}
              </button>
            </div>

            {showPassForm && (
              <form onSubmit={handleChangePassword} className="space-y-3">
                {[
                  { key: "current", label: "Current Password"  },
                  { key: "next",    label: "New Password"       },
                  { key: "confirm", label: "Confirm New Password" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
                    <div className="relative">
                      <input
                        type={showPass[key] ? "text" : "password"}
                        value={passForm[key]}
                        onChange={(e) => setPassForm((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 pr-10 transition"
                        required
                      />
                      <button type="button"
                        onClick={() => setShowPass((p) => ({ ...p, [key]: !p[key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                        {showPass[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
                <button type="submit" disabled={savingPass}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-bold transition flex items-center justify-center gap-2 mt-2">
                  {savingPass ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                  {savingPass ? "Saving..." : "Update Password"}
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
