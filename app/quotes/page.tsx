"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Quote {
  Client_ID: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone: string;
  Journey_Interest: string;
  Status: string;
  Created_Date: string;
  Number_Travelers: string;
  Days: string;
  Budget: string;
  site_id: string;
  site_name: string;
  Message: string;
}

const statusOptions = ["ALL", "NEW", "IN_PROGRESS", "ITINERARY_READY", "PRICED", "SENT_TO_CLIENT", "PAID", "CANCELLED"];
const countryOptions = ["ALL", "slow-morocco", "slow-namibia", "slow-turkiye", "slow-tunisia", "slow-mauritius"];

const statusColors: { [key: string]: string } = {
  NEW: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-yellow-50 text-yellow-700",
  ITINERARY_READY: "bg-green-50 text-green-700",
  PRICED: "bg-green-50 text-green-700",
  SENT_TO_CLIENT: "bg-purple-50 text-purple-700",
  PAID: "bg-emerald-50 text-emerald-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

const countryLabels: { [key: string]: string } = {
  "slow-morocco": "Morocco",
  "slow-namibia": "Namibia",
  "slow-turkiye": "Türkiye",
  "slow-tunisia": "Tunisia",
  "slow-mauritius": "Mauritius",
};

// Clean, minimal SVG icons
const Icons = {
  view: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3" />
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
    </svg>
  ),
  email: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="14" height="10" rx="1" />
      <path d="M1 4l7 5 7-5" />
    </svg>
  ),
};

function QuotesContent() {
  const searchParams = useSearchParams();
  const initialCountry = searchParams.get("country") || "ALL";

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState(initialCountry === "ALL" ? "ALL" : `slow-${initialCountry}`);
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Selected quote for detail view
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  useEffect(() => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((data) => {
        setQuotes(data.quotes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Filter quotes
  const filteredQuotes = quotes.filter((q) => {
    if (statusFilter !== "ALL" && q.Status !== statusFilter) return false;
    if (countryFilter !== "ALL" && q.site_id !== countryFilter) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const name = `${q.First_Name} ${q.Last_Name}`.toLowerCase();
      const email = (q.Email || "").toLowerCase();
      if (!name.includes(search) && !email.includes(search)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-foreground/10 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm tracking-[0.2em] uppercase">
            S L O W &nbsp; W O R L D
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/quotes" className="text-sm font-medium">
              QUOTES
            </Link>
            <Link href="/proposals" className="text-sm text-foreground/50 hover:text-foreground transition-colors">
              PROPOSALS
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl">All Quotes</h1>
          <Link 
            href="/"
            className="text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-foreground/10 bg-transparent text-sm focus:outline-none focus:border-foreground/30 w-64"
          />
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-4 py-2 border border-foreground/10 bg-transparent text-sm focus:outline-none focus:border-foreground/30"
          >
            <option value="ALL">All Countries</option>
            {countryOptions.slice(1).map((c) => (
              <option key={c} value={c}>{countryLabels[c]}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-foreground/10 bg-transparent text-sm focus:outline-none focus:border-foreground/30"
          >
            <option value="ALL">All Statuses</option>
            {statusOptions.slice(1).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : (
          <div className="border border-foreground/10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 text-left">
                    <th className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium">Client</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium">Country</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium">Journey</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium">Travelers</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium">Budget</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium">Status</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-foreground/50">
                        No quotes found.
                      </td>
                    </tr>
                  ) : (
                    filteredQuotes.map((quote) => (
                      <tr 
                        key={quote.Client_ID} 
                        className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors"
                      >
                        <td className="px-4 py-4">
                          <p className="font-medium">{quote.First_Name} {quote.Last_Name}</p>
                          <p className="text-foreground/50 text-xs">{quote.Email}</p>
                        </td>
                        <td className="px-4 py-4">
                          {countryLabels[quote.site_id] || quote.site_id}
                        </td>
                        <td className="px-4 py-4 text-foreground/70">
                          {quote.Journey_Interest || "—"}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {quote.Number_Travelers || "—"}
                        </td>
                        <td className="px-4 py-4">
                          {quote.Budget ? `€${parseInt(quote.Budget).toLocaleString()}` : "—"}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2 py-1 rounded ${statusColors[quote.Status] || "bg-gray-100 text-gray-600"}`}>
                            {quote.Status?.replace(/_/g, " ") || "NEW"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-foreground/50">
                          {formatDate(quote.Created_Date)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setSelectedQuote(quote)}
                              className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded transition-colors"
                              title="View Details"
                            >
                              {Icons.view}
                            </button>
                            <a
                              href={`mailto:${quote.Email}`}
                              className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded transition-colors"
                              title="Email Client"
                            >
                              {Icons.email}
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-foreground/50">
          Showing {filteredQuotes.length} of {quotes.length} quotes
        </p>
      </main>

      {/* Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setSelectedQuote(null)} />
          <div className="relative bg-background w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-foreground/10 p-6 flex items-center justify-between">
              <h2 className="font-serif text-xl">Quote Details</h2>
              <button 
                onClick={() => setSelectedQuote(null)}
                className="text-foreground/40 hover:text-foreground/70 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Quote ID</p>
                <p className="font-mono text-sm">{selectedQuote.Client_ID}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Client</p>
                  <p className="font-medium">{selectedQuote.First_Name} {selectedQuote.Last_Name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Email</p>
                  <p className="text-sm">{selectedQuote.Email}</p>
                </div>
              </div>
              {selectedQuote.Phone && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Phone</p>
                  <p className="text-sm">{selectedQuote.Phone}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Country</p>
                  <p>{countryLabels[selectedQuote.site_id] || selectedQuote.site_id}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Journey</p>
                  <p>{selectedQuote.Journey_Interest || "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Travelers</p>
                  <p>{selectedQuote.Number_Travelers || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Days</p>
                  <p>{selectedQuote.Days || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Budget</p>
                  <p className="font-medium">{selectedQuote.Budget ? `€${parseInt(selectedQuote.Budget).toLocaleString()}` : "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Status</p>
                <span className={`text-xs px-2 py-1 rounded ${statusColors[selectedQuote.Status] || "bg-gray-100 text-gray-600"}`}>
                  {selectedQuote.Status?.replace(/_/g, " ") || "NEW"}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Date</p>
                <p className="text-sm">{formatDate(selectedQuote.Created_Date)}</p>
              </div>
              {selectedQuote.Message && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Message</p>
                  <p className="text-sm text-foreground/70">{selectedQuote.Message}</p>
                </div>
              )}
              <div className="pt-4 border-t border-foreground/10 space-y-3">
                <a
                  href={`mailto:${selectedQuote.Email}`}
                  className="block w-full text-center text-xs uppercase tracking-wide border border-foreground px-4 py-3 hover:bg-foreground hover:text-background transition-colors"
                >
                  Email Client
                </a>
                <Link
                  href={`/proposals/new?quote_id=${selectedQuote.Client_ID}`}
                  className="block w-full text-center text-xs uppercase tracking-wide bg-foreground text-background px-4 py-3 hover:bg-foreground/80 transition-colors"
                >
                  Create Proposal
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuotesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    }>
      <QuotesContent />
    </Suspense>
  );
}
