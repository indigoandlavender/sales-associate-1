import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sales Associate | Slow World",
  description: "Booking and proposal management for Slow World properties",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-8">
                  <a href="/" className="text-lg font-semibold tracking-tight">
                    Sales Associate
                  </a>
                  <nav className="hidden md:flex items-center gap-6">
                    <a
                      href="/"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/quotes"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Quotes
                    </a>
                    <a
                      href="/proposals"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Proposals
                    </a>
                  </nav>
                </div>
                <div className="text-sm text-gray-500">
                  Slow World Network
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
