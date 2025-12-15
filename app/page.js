"use client";

import DashboardSidebar from "./components/DashboardSidebar";
import DashboardContent from "./components/DashboardContent";

export default function Home() {
  return (
    <div className="flex h-screen w-screen bg-zinc-950 overflow-hidden text-zinc-100 font-sans">
      <DashboardSidebar />
      <DashboardContent />
    </div>
  );
}
