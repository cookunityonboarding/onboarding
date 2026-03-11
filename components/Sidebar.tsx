"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  // hide sidebar on login
  if (pathname === "/" || !user) return null;

  const isSupervisorView =
    user?.role === "supervisor" ||
    user?.role === "manager" ||
    user?.role === "assistant_manager";

  return (
    <aside className="w-64 bg-[#2C282B] text-white p-4 min-h-screen hidden md:block">
      <nav className="flex flex-col gap-3">
        <Link href="/team" className="px-3 py-2 rounded hover:bg-[#333] text-[#F5C027]">
          CX Leadership Team
        </Link>
        {isSupervisorView ? (
          <Link
            href="/supervisor/trainees"
            className="px-3 py-2 rounded hover:bg-[#333] text-[#F5C027]"
          >
            Supervisor
          </Link>
        ) : (
          <Link href="/modules" className="px-3 py-2 rounded hover:bg-[#333] text-[#F5C027]">
            Training
          </Link>
        )}
      </nav>
    </aside>
  );
}