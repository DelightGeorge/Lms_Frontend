import React from "react";
import Layout from "../shared/Layout/Layout";
import { Bell } from "lucide-react";

const Notifications = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>

        <div className="bg-white border rounded-2xl p-10 text-center">
          <Bell size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-500">
            You have no notifications yet.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
