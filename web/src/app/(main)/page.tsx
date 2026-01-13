import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function Home() {
  return (
    <div className="w-full mt-8 pt-24">
      {/* ================= HERO ================= */}
      <section
        className="w-full h-[80vh] bg-cover bg-center relative"
        style={{ backgroundImage: "url('/images/cutt.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

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

      {/* ================= ABOUT ================= */}
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

            <div className="grid grid-cols-2 gap-6 mt-8">
              {[
                [
                  "Professional",
                  "Skilled barbers with experience and passion.",
                ],
                [
                  "Premium Service",
                  "High quality tools and grooming products.",
                ],
                ["Comfort Space", "Relaxing place with modern interior."],
                [
                  "Best Experience",
                  "Grooming experience that boosts confidence.",
                ],
              ].map(([title, desc]) => (
                <div key={title}>
                  <h4 className="text-[#C8A36A] font-semibold text-lg">
                    {title}
                  </h4>
                  <p className="text-sm text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Kanan – Gambar */}
          <div className="flex justify-center">
            <Image
              src="/images/about.png"
              alt="About Barber-X"
              width={480}
              height={350}
              className="rounded-xl shadow-2xl w-[380px] md:w-[480px] object-cover border-2 border-gray-300"
            />
          </div>
        </div>
      </section>

      {/* ================= CATALOG ================= */}
      <section
        id="services"
        className="w-full bg-[#FAF7F2] px-6 md:px-16 py-32"
      >
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold text-[#3F3F3F]">
            OUR SERVICES
          </h2>
          <p className="text-gray-500 mt-3">
            Choose the best service for your style
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            ["Haircut", "Rp 30.000", "/images/haircutt.png"],
            ["Haircut + Wash", "Rp 40.000", "/images/wash.png"],
            ["Beard Trim", "Rp 25.000", "/images/beard.png"],
            ["Hair Coloring", "Rp 80.000", "/images/coloring.png"],
            ["Creambath", "Rp 45.000", "/images/creambath.png"],
            ["Face Treatment", "Rp 50.000", "/images/facial.png"],
          ].map(([title, price, img]) => (
            <div
              key={title}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden max-w-[300px] mx-auto"
            >
              <Image
                src={img}
                alt={title}
                width={300}
                height={200}
                className="object-cover w-full h-[180px]"
              />

              <div className="p-5">
                <h3 className="text-lg font-semibold text-[#3F3F3F]">
                  {title}
                </h3>

                <div className="w-10 h-[3px] bg-[#C8A36A] my-3"></div>

                <p className="text-sm text-gray-500 mb-4">
                  Professional service for your best style.
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#C8A36A]">
                    {price}
                  </span>

                  <Link href="/booking">
                    <Button>Book</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ================= CONTACT ================= */}
      <section
        id="contact"
        className="w-full bg-[#F4EBD8] px-6 md:px-16 py-32"
      ></section>
      <div>
        <span className="text-sm tracking-widest text-[#C8A36A] uppercase">
          Contact Us
        </span>

        <h2 className="text-3xl md:text-5xl font-bold text-[#2E2E2E] mt-3 mb-6">
          Get In Touch With Barber-X
        </h2>

        <p className="text-gray-600 mb-10 leading-relaxed">
          Have questions or want to book an appointment? Contact us directly and
          get premium grooming experience.
        </p>
        <div className="space-y-6">
              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C8A36A] flex items-center justify-center text-white">
                  <FaMapMarkerAlt />
                </div>
              </div>

              
            </div>
          </div>

        
      </div>

  );
}
