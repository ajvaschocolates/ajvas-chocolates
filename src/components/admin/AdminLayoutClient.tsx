"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminLayoutClientProps {
  userEmail?: string | null;
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  userEmail,
  children,
}: AdminLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-parchment flex antialiased selection:bg-cocoa-800 selection:text-white">
      {/* Sidebar Navigation */}
      <AdminSidebar
        userEmail={userEmail}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <AdminHeader userEmail={userEmail} onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Dynamic Page Content */}
        <div className="flex-1">{children}</div>

      </div>
    </div>
  );
}
