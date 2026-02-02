import Layout from "../../shared/Layout/Layout";


const AdminDashboard = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-black mb-10">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Total Users", value: "12,430" },
            { label: "Courses", value: "312" },
            { label: "Revenue", value: "$84,200" },
          ].map(stat => (
            <div key={stat.label} className="border rounded-2xl p-6">
              <p className="text-slate-500 text-sm">{stat.label}</p>
              <p className="text-3xl font-black">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
