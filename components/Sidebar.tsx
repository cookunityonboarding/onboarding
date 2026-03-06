"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  // hide sidebar on login
  if (pathname === "/") return null;

  return (
    <aside className="w-64 bg-[#2C282B] text-white p-4 min-h-screen hidden md:block">
      <nav className="flex flex-col gap-3">
        <Link href="/team" className="px-3 py-2 rounded hover:bg-[#333] text-[#F5C027]">
          CX Leadership Team
        </Link>
        <Link href="/modules" className="px-3 py-2 rounded hover:bg-[#333] text-[#F5C027]">
          Training
        </Link>
      </nav>
    </aside>
  );
}