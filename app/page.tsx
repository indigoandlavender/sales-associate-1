"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Quote {
  Quote_ID: string;
  Timestamp: string;
  Status: string;
  Country: string;
  Journey: string;
  Name: string;
  Email: string;
  Budget: string;
  Travelers: string;
}

interface DashboardStats {
  newQuotes: number;
  inProgress: number;
  totalQuotes: number;
}

export default function SalesAssociateDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    newQuotes: 0,
    inProgress: 0,
    totalQuotes: 0,
  });
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((data) => {
        const quotes = data.quotes || [];
        
        setStats({
          newQuotes: quotes.filter((q: Quote) => q.Status === "New").length,
          inProgress: quotes.filter((q: Quote) => q.Status === "In Progress").length,
          totalQuotes: quotes.length,
        });
        setRecentQuotes(quotes.slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - matches Slow Morocco */}
      <header className="border-b border-foreground/10 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm tracking-[0.2em] uppercase">
            S L O W &nbsp; W O R L D
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/quotes" className="text-sm hover:opacity-70 transition-opacity">
              QUOTES
            </Link>
            <Link href="/proposals" className="text-sm hover:opacity-70 transition-opacity">
              PROPOSALS
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Quick Stats - 3 columns like screenshot */}
            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="text-center">
                <p className="text-4xl font-serif">{stats.newQuotes}</p>
                <p className="text-sm text-foreground/50 mt-1">New</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-serif">{stats.inProgress}</p>
                <p className="text-sm text-foreground/50 mt-1">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-serif">{stats.totalQuotes}</p>
                <p className="text-sm text-foreground/50 mt-1">Total Quotes</p>
              </div>
            </div>

            {/* Primary Tools - card style like screenshot */}
            <div className="space-y-4 mb-16">
              <Link
                href="/quotes/new"
                className="block p-8 border border-foreground/10 hover:border-foreground transition-colors"
              >
                <h2 className="font-serif text-xl mb-2">Quote Builder</h2>
                <p className="text-foreground/50 text-sm">
                  Create a custom journey quote for a client
                </p>
              </Link>
              <Link
                href="/quotes"
                className="block p-8 border border-foreground/10 hover:border-foreground transition-colors"
              >
                <h2 className="font-serif text-xl mb-2">View All Quotes</h2>
                <p className="text-foreground/50 text-sm">
                  See and manage all quote requests
                </p>
              </Link>
              <Link
                href="/calculator"
                className="block p-8 border border-foreground/10 hover:border-foreground transition-colors"
              >
                <h2 className="font-serif text-xl mb-2">Price Calculator</h2>
                <p className="text-foreground/50 text-sm">
                  Calculate journey costs and margins
                </p>
              </Link>
            </div>

            {/* Other Tools - grid like screenshot */}
            <div className="border-t border-foreground/10 pt-12">
              <p className="text-xs uppercase tracking-wide text-foreground/50 mb-6">Other Tools</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  href="/journeys"
                  className="p-4 border border-foreground/10 hover:border-foreground transition-colors text-center"
                >
                  <p className="text-sm">Journeys</p>
                </Link>
                <Link
                  href="/accommodations"
                  className="p-4 border border-foreground/10 hover:border-foreground transition-colors text-center"
                >
                  <p className="text-sm">Accommodations</p>
                </Link>
                <Link
                  href="/content"
                  className="p-4 border border-foreground/10 hover:border-foreground transition-colors text-center"
                >
                  <p className="text-sm">Content Library</p>
                </Link>
                <Link
                  href="/settings"
                  className="p-4 border border-foreground/10 hover:border-foreground transition-colors text-center"
                >
                  <p className="text-sm">Settings</p>
                </Link>
              </div>
            </div>

            {/* Recent Quotes */}
            {recentQuotes.length > 0 && (
              <div className="border-t border-foreground/10 pt-12 mt-12">
                <p className="text-xs uppercase tracking-wide text-foreground/50 mb-6">Recent Quotes</p>
                <div className="space-y-3">
                  {recentQuotes.map((quote) => (
                    <Link 
                      key={quote.Quote_ID}
                      href={`/quotes/${quote.Quote_ID}`}
                      className="flex items-center justify-between p-4 border border-foreground/10 hover:border-foreground/30 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{quote.Name}</p>
                        <p className="text-sm text-foreground/50">
                          {quote.Country} • {quote.Journey || "Custom Journey"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{quote.Travelers} travelers</p>
                        <p className="text-sm text-foreground/50">{quote.Budget}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link 
                  href="/quotes" 
                  className="block text-center text-sm text-foreground/50 hover:text-foreground mt-4"
                >
                  View all →
                </Link>
              </div>
            )}

            {/* Filter by Country */}
            <div className="border-t border-foreground/10 pt-12 mt-12">
              <p className="text-xs uppercase tracking-wide text-foreground/50 mb-6">Filter by Country</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Link
                  href="/quotes?country=morocco"
                  className="p-4 border border-foreground/10 hover:border-foreground transition-colors text-center"
                >
                  <p className="text-sm">Morocco</p>
                </Link>
                <Link
                  href="/quotes?country=namibia"
                  className="p-4 border border-foreground/10 hover:border-foreground transition-colors text-center"
                >
                  <p className="text-sm">Namibia</p>
                </Link>
                <Link
                  href="/quotes?country=turkiye"
                  className="p-4 border border-foreground/10 hover:border-foreground transition-colors text-center"
                >
                  <p className="text-sm">Türkiye</p>
                </Link>
                <Link
                  href="/quotes?country=tunisia"
                  className="p-4 border border-foreground/10 hover:border-foreground transition-colors text-center"
                >
                  <p className="text-sm">Tunisia</p>
                </Link>
                <Link
                  href="/quotes?country=mauritius"
                  className="p-4 border border-foreground/10 hover:border-foreground transition-colors text-center"
                >
                  <p className="text-sm">Mauritius</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
