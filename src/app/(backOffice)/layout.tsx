import Navbar from "../components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Easier Backup - Management",
  description: "Easier Backup Management Page",
  icons: {
    icon: '/logo.png',
  },
};

export default function BackOfficeLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
      </main>
    </div>
  );
}
