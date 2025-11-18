export default function Home() {
  return (
    <div className="w-full mt-8">

      {/* Hero Section */}
      <section
        className="w-full h-[80vh] bg-cover bg-center relative"
        style={{
          backgroundImage: "url('/logo.png')",
        }}
      >
        {/* Overlay gelap */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Teks */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-[#E9DFC7] drop-shadow-lg">
            Selamat Datang di Barber-X
          </h1>

          <p className="mt-4 text-sm md:text-lg text-gray-200 max-w-xl">
            Barbershop premium dengan pelayanan profesional untuk gaya terbaik Anda.
          </p>

          
        </div>
      </section>
    </div>
  );
}
