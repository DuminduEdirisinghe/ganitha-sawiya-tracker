import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LayoutDashboard, Calendar, Users, LogIn } from "lucide-react";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ganitha Sawiya Tracker",
  description: "Tracking progress of Sasnaka Sansada Ganitha Sawiya Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const authToken = cookieStore.get("auth_token");
  let isAdmin = false;

  if (authToken) {
    if (authToken.value === "admin_logged_in_v2") {
      isAdmin = true;
    } else {
      try {
        // Try parsing JSON token
        const payload = JSON.parse(authToken.value);
        if (payload.username) isAdmin = true;
      } catch (e) {
        // Invalid token
      }
    }
  }

  return (
    <html lang="en">
      <body className={cn(inter.className, "min-h-screen bg-slate-50 text-slate-900")}>
        <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
                <span>Ganitha Sawiya</span>
              </Link>

              <div className="hidden md:flex space-x-8">
                <Link href="/" className="flex items-center space-x-1 hover:text-blue-200 transition">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link href="/calendar" className="flex items-center space-x-1 hover:text-blue-200 transition">
                  <Calendar size={18} />
                  <span>Calendar</span>
                </Link>
                {isAdmin && (
                  <Link href="/volunteers" className="flex items-center space-x-1 hover:text-blue-200 transition">
                    <Users size={18} />
                    <span>Volunteers</span>
                  </Link>
                )}
              </div>

              <div>
                <Link href="/admin" className="flex items-center space-x-1 bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md transition text-sm font-medium">
                  {isAdmin ? (
                    <>
                      <LayoutDashboard size={16} />
                      <span>Admin Dashboard</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      <span>Admin Login</span>
                    </>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
