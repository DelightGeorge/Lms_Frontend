import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // connect backend later
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Image Section */}
      <div className="hidden md:flex w-1/2 bg-blue-600 items-center justify-center">
        <img
          src="/register-illustration.svg"
          alt="Learning illustration"
          className="w-3/4"
        />
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white p-6 rounded shadow"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            Create Account
          </h2>

          {/* Google Button */}
          <button
            type="button"
            className="w-full border py-2 rounded mb-4 flex items-center justify-center gap-2"
            onClick={() => alert("Google login coming soon")}
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="text-center text-sm text-gray-500 mb-4">
            or
          </div>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mb-3"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mb-3"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mb-3"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mb-4"
          >
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Create Account
          </button>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
