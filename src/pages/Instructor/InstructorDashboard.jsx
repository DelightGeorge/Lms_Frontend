import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Layout from "../../shared/Layout/Layout";
import { getInstructorCourses, createCourse } from "../../services/instructorService";

const InstructorDashboard = () => {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    category: "Development",
    description: "",
  });
  const [error, setError] = useState("");

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getInstructorCourses();
        // Handle backend returning object or array
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setCourses(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await createCourse(formData);
      setCourses((prev) => [...prev, res.data.course]); // Add new course to state
      setOpen(false);
      setFormData({ title: "", category: "Development", description: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create course.");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900">
              Instructor Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your courses and students
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition cursor-pointer"
          >
            + Create Course
          </button>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Courses */}
        {loading ? (
          <p className="text-slate-500">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-slate-500">You haven’t created any courses yet.</p>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white border rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition"
              >
                <div>
                  <h3 className="font-bold text-lg">{course.title}</h3>
                  <p className="text-sm text-slate-500">
                    {course.students?.length || 0} students enrolled
                  </p>
                  <p className="text-sm text-slate-400">{course.status}</p>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    course.status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-600"
                      : course.status === "DRAFT"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {course.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center">
            <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 animate-slideUp">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">Create New Course</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleCreateCourse}>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Course Title
                  </label>
                  <input
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Complete React Mastery"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Development</option>
                    <option>Design</option>
                    <option>Business</option>
                    <option>Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">
                    Course Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Short description of the course"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 border rounded-xl py-3 font-bold hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-bold hover:bg-blue-700 transition"
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default InstructorDashboard;
