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
          <h1 className="text-xl font-bold tracking-widest text-[#3F3F3F]">
            BARBER-X
          </h1>
        </div>

        {/* Menu */}
        <div className="hidden md:flex gap-8 font-medium text-[#3F3F3F]">
          <Link href="/" className="hover:text-[#000000] transition relative group">
            Home
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-[#000000] transition-all duration-300 group-hover:w-full"></span>
          </Link>


        </div>



      </div>
    </nav>
  );
}
