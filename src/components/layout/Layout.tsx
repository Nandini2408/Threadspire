
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Layout = ({ children, fullWidth = false }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-1 ${fullWidth ? '' : 'max-w-7xl mx-auto'} px-4 md:px-6 lg:px-8 py-6 md:py-8 w-full`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
