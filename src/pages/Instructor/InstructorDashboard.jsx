import Layout from "../../shared/Layout/Layout";

const InstructorDashboard = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black">Instructor Dashboard</h1>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
            Create Course
          </button>
        </div>

        <div className="space-y-4">
          {[1,2].map(course => (
            <div key={course} className="border rounded-2xl p-6 flex justify-between">
              <div>
                <h3 className="font-bold">React Bootcamp</h3>
                <p className="text-sm text-slate-500">120 students</p>
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full">
                Published
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default InstructorDashboard;
