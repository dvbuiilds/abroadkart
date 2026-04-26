import { Navbar } from "@app/components/Navbar";
import { Footer } from "@app/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
