"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#F5ECD6] shadow-md border-b border-black/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Barber-X Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />

        </div>

      </div>
    </nav>
  );
}
