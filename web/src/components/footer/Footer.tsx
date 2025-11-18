import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#2F2F2F] text-[#E8DFC8] py-12 mt-28 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* Brand */}
        <div>
          <h2 className="text-xl font-semibold tracking-widest">BARBER-X</h2>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Barbershop premium di Bandar Lampung dengan pelayanan profesional
            dan pengalaman grooming terbaik.
          </p>
        </div>

        {/* Menu */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-[#C8A36A]">Menu</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/home" className="hover:text-[#C8A36A] transition">Home</Link>
            <Link href="/services" className="hover:text-[#C8A36A] transition">Layanan</Link>
            <Link href="/booking" className="hover:text-[#C8A36A] transition">Booking</Link>

          </div>
        </div>


      </div>

      {/* Copyright */}
      <div className="text-center text-xs text-gray-500 mt-10">
        © {new Date().getFullYear()} Barber-X — All Rights Reserved.
      </div>
    </footer>
  );
}
