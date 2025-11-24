import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}