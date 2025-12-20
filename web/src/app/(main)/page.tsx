import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="w-full mt-8 pt-24">
      {/* Hero Section */}
      <section
        className="w-full h-[80vh] bg-cover bg-center relative"
        style={{
          backgroundImage: "url('/images/cutt.jpg')",
        }}
      >
        {/* Overlay gelap */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Teks */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-[#E9DFC7] drop-shadow-lg">
            Welcome To Barber-X
          </h1>

          <p className="mt-4 text-sm md:text-lg text-gray-200 max-w-xl">
            Barber-X is a Premium barbershop with professional service for your
            best style.
          </p>

          <Link href="/booking">
            <Button className="mt-6 px-6 py-3 bg-[#C8A36A] text-black text-sm font-semibold hover:bg-[#E9DFC7]">
              Booking Now!
            </Button>
          </Link>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section
        id="about"
        className="w-full bg-[#0E0E0E] px-6 md:px-16 py-32 mt-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Kiri – Teks */}
          <div className="text-center md:text-left">
            <span className="text-sm tracking-widest text-[#C8A36A] uppercase">
              About Us
            </span>

            <h2 className="text-3xl md:text-5xl font-bold text-[#E9DFC7] mt-3 mb-6">
              More Than Just a Haircut
            </h2>

            <p className="text-gray-300 md:text-lg leading-relaxed">
              Barber-X is a premium barbershop delivering a modern grooming
              experience with comfort, precision, and professional service.
            </p>
          </div>

          {/* Kanan – Gambar */}
          <div className="flex justify-center">
            <Image
              src="/images/cutt.jpg"
              alt="About Barber-X"
              width={480}
              height={350}
              className="rounded-xl shadow-2xl w-[380px] md:w-[480px] object-cover border-2 border-gray-300"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
