import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-[#2F2F2F] to-[#1F1F1F] text-[#E8DFC8] py-16 mt-28">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-14">
        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-bold tracking-[0.3em] text-[#C8A36A]">
            BARBER-X
          </h2>

          <div className="w-14 h-[3px] bg-[#C8A36A] my-4"></div>

          <p className="text-sm text-gray-400 leading-relaxed">
            A premium barbershop in Bandar Lampung with professional service and
            the best grooming experience.
          </p>
        </div>

        <ul className="flex flex-col gap-3 text-sm">
           {[
              { name: "Home", href: "#home" },
              { name: "Catalog", href: "#services" },
              { name: "Booking", href: "/booking" },
              { name: "About", href: "#about" },
              { name: "Contact", href: "#contact" },
            ].map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="hover:text-[#C8A36A] transition">
                  {item.name}
                
                </Link>
              </li>
            ))}
          </ul>

        {/* CONTACT */}
        <div>
          <h3 className="font-semibold text-lg mb-4 text-[#C8A36A]">Contact</h3>
        </div>

        <div className="space-y-3 text-sm text-gray-400">
            <p>📞 WhatsApp: 0812-3456-7890</p>
            <p>📸 Instagram: @barberx.id</p>
            <p>📍 Bandar Lampung</p>
          </div>

      </div>

      {/* DIVIDER */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-white/10 mt-14 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Barber-X — All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
