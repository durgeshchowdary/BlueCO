"use client";

import AcademySidebar from "@/components/academy/AcademySidebar";

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fffdf0]">

      {/* Sidebar */}
      <AcademySidebar />

      {/* Main content */}
      <main className="ml-[260px] min-h-screen">

        {children}

      </main>

    </div>
  );
}