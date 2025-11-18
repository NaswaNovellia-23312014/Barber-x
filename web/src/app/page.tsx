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

        
      </section>
    </div>
  );
}
