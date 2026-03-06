import React from "react";
import Footer from "../Footer";
import Navbar from "../Navbar/Navbar";
import FloatingActionBar from "../../Components/FloatingActionBar/FloatingActionBar";


const Layout = ({ children, hideFloatingBar = false }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {children}
      </main>

      {/* Floating action bar - shown on all pages except checkout pages */}
      {!hideFloatingBar && (
        <FloatingActionBar hideOnPages={["/cart", "/checkout", "/payment", "/auth"]} />
      )}

      <Footer />
    </div>
  );
};

export default Layout;
