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

type SortField = "Client_ID" | "Name" | "Email" | "Journey" | "Date" | "Status";
type SortDirection = "asc" | "desc";

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
  edit: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z" />
    </svg>
  ),
  duplicate: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="9" height="9" rx="1" />
      <path d="M2 11V3a1 1 0 011-1h8" />
    </svg>
  ),
  delete: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </svg>
  ),
  sortAsc: (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
      <path d="M4 1l3 5H1l3-5z" />
    </svg>
  ),
  sortDesc: (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
      <path d="M4 7l3-5H1l3 5z" />
    </svg>
  ),
};

function QuotesContent() {
  const searchParams = useSearchParams();
  const initialCountry = searchParams.get("country") || "ALL";

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>("Date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Sort quotes
  const sortedQuotes = [...quotes].sort((a, b) => {
    let aVal: string | number = "";
    let bVal: string | number = "";
    
    switch (sortField) {
      case "Client_ID":
        aVal = a.Client_ID || "";
        bVal = b.Client_ID || "";
        break;
      case "Name":
        aVal = `${a.First_Name} ${a.Last_Name}`.toLowerCase();
        bVal = `${b.First_Name} ${b.Last_Name}`.toLowerCase();
        break;
      case "Email":
        aVal = (a.Email || "").toLowerCase();
        bVal = (b.Email || "").toLowerCase();
        break;
      case "Journey":
        aVal = (a.Journey_Interest || "").toLowerCase();
        bVal = (b.Journey_Interest || "").toLowerCase();
        break;
      case "Date":
        aVal = a.Created_Date || "";
        bVal = b.Created_Date || "";
        break;
      case "Status":
        aVal = a.Status || "";
        bVal = b.Status || "";
        break;
    }
    
    if (sortDirection === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 opacity-30">↕</span>;
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  const handleEdit = (quote: Quote) => {
    // Navigate to edit page with site_id
    window.location.href = `/quotes/${quote.Client_ID}/edit?site_id=${quote.site_id}`;
  };

  const handleDuplicate = async (quote: Quote) => {
    if (!confirm(`Duplicate quote for ${quote.First_Name} ${quote.Last_Name}?`)) return;
    
    try {
      const res = await fetch("/api/quotes/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote_id: quote.Client_ID, site_id: quote.site_id }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error duplicating quote:", err);
    }
  };

  const handleDelete = async (quote: Quote) => {
    if (!confirm(`Delete quote ${quote.Client_ID} for ${quote.First_Name} ${quote.Last_Name}? This cannot be undone.`)) return;
    
    try {
      const res = await fetch("/api/quotes/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote_id: quote.Client_ID, site_id: quote.site_id }),
      });
      if (res.ok) {
        setQuotes(quotes.filter(q => q.Client_ID !== quote.Client_ID));
      }
    } catch (err) {
      console.error("Error deleting quote:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - matches Slow Morocco exactly */}
      <header className="border-b border-foreground/10 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm tracking-[0.2em] uppercase">
            S L O W &nbsp; W O R L D
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/quotes" className="text-sm">
              QUOTES
            </Link>
            <Link href="/proposals" className="text-sm text-foreground/50 hover:text-foreground transition-colors">
              PROPOSALS
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Title - matches screenshot */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-serif text-3xl">All Quotes</h1>
          <Link 
            href="/"
            className="text-xs uppercase tracking-wide text-foreground/50 hover:text-foreground transition-colors border border-foreground/20 px-4 py-2"
          >
            Back to Dashboard
          </Link>
        </div>
        <p className="text-sm text-foreground/50 mb-8">{sortedQuotes.length} of {quotes.length} quotes</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : (
          <div className="border border-foreground/10 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 text-left bg-foreground/[0.02]">
                    <th 
                      className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("Client_ID")}
                    >
                      Client ID <SortIcon field="Client_ID" />
                    </th>
                    <th 
                      className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("Name")}
                    >
                      Name <SortIcon field="Name" />
                    </th>
                    <th 
                      className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("Email")}
                    >
                      Email <SortIcon field="Email" />
                    </th>
                    <th 
                      className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("Journey")}
                    >
                      Journey <SortIcon field="Journey" />
                    </th>
                    <th 
                      className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("Date")}
                    >
                      Date <SortIcon field="Date" />
                    </th>
                    <th 
                      className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("Status")}
                    >
                      Status <SortIcon field="Status" />
                    </th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedQuotes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-foreground/50">
                        No quotes found.
                      </td>
                    </tr>
                  ) : (
                    sortedQuotes.map((quote) => (
                      <tr 
                        key={quote.Client_ID} 
                        className="border-b border-foreground/5 hover:bg-foreground/[0.01] transition-colors"
                      >
                        <td className="px-4 py-4 font-mono text-xs text-foreground/70">
                          {quote.Client_ID}
                        </td>
                        <td className="px-4 py-4">
                          {quote.First_Name} {quote.Last_Name}
                        </td>
                        <td className="px-4 py-4 text-foreground/70">
                          {quote.Email}
                        </td>
                        <td className="px-4 py-4 text-foreground/70">
                          {quote.Journey_Interest || "Custom"}
                        </td>
                        <td className="px-4 py-4 text-foreground/70">
                          {formatDate(quote.Created_Date)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2 py-1 rounded uppercase tracking-wide ${statusColors[quote.Status] || "bg-blue-50 text-blue-700"}`}>
                            {quote.Status?.replace(/_/g, " ") || "NEW"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(quote)}
                              className="p-1.5 text-foreground/30 hover:text-foreground transition-colors"
                              title="Edit"
                            >
                              {Icons.edit}
                            </button>
                            <button
                              onClick={() => handleDuplicate(quote)}
                              className="p-1.5 text-foreground/30 hover:text-foreground transition-colors"
                              title="Duplicate"
                            >
                              {Icons.duplicate}
                            </button>
                            <button
                              onClick={() => handleDelete(quote)}
                              className="p-1.5 text-foreground/30 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              {Icons.delete}
                            </button>
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
      </main>
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
