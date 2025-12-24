"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
  Message: string;
  site_id: string;
}

const statusOptions = ["NEW", "IN_PROGRESS", "ITINERARY_READY", "PRICED", "SENT_TO_CLIENT", "PAID", "CANCELLED"];

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const quoteId = params.id as string;
  const siteId = searchParams.get("site_id") || "";

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quoteId) return;

    fetch(`/api/quotes/${quoteId}?site_id=${siteId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.quote) {
          setQuote({ ...data.quote, site_id: siteId });
        } else {
          setError("Quote not found");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load quote");
        setLoading(false);
      });
  }, [quoteId, siteId]);

  const handleChange = (field: keyof Quote, value: string) => {
    if (!quote) return;
    setQuote({ ...quote, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/quotes/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_id: quote.Client_ID,
          site_id: quote.site_id,
          updates: {
            First_Name: quote.First_Name,
            Last_Name: quote.Last_Name,
            Email: quote.Email,
            Phone: quote.Phone,
            Journey_Interest: quote.Journey_Interest,
            Status: quote.Status,
            Number_Travelers: quote.Number_Travelers,
            Days: quote.Days,
            Budget: quote.Budget,
            Message: quote.Message,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/quotes");
      } else {
        setError(data.error || "Failed to save changes");
      }
    } catch (err) {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !quote) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-foreground/10 py-4 px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-sm tracking-[0.2em] uppercase">
              S L O W &nbsp; W O R L D
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-red-600">{error}</p>
          <Link href="/quotes" className="text-sm text-foreground/50 hover:text-foreground mt-4 block">
            ← Back to Quotes
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-foreground/10 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl mb-1">Edit Quote</h1>
            <p className="text-sm text-foreground/50 font-mono">{quoteId}</p>
          </div>
          <Link 
            href="/quotes"
            className="text-xs uppercase tracking-wide text-foreground/50 hover:text-foreground transition-colors border border-foreground/20 px-4 py-2"
          >
            Cancel
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client Information */}
          <div className="border border-foreground/10 p-6">
            <h2 className="text-xs uppercase tracking-wide text-foreground/50 mb-6">Client Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs uppercase tracking-wide text-foreground/50 block mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={quote?.First_Name || ""}
                  onChange={(e) => handleChange("First_Name", e.target.value)}
                  className="w-full border border-foreground/10 px-4 py-2 bg-transparent text-sm focus:outline-none focus:border-foreground/30"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-foreground/50 block mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={quote?.Last_Name || ""}
                  onChange={(e) => handleChange("Last_Name", e.target.value)}
                  className="w-full border border-foreground/10 px-4 py-2 bg-transparent text-sm focus:outline-none focus:border-foreground/30"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-foreground/50 block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={quote?.Email || ""}
                  onChange={(e) => handleChange("Email", e.target.value)}
                  className="w-full border border-foreground/10 px-4 py-2 bg-transparent text-sm focus:outline-none focus:border-foreground/30"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-foreground/50 block mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={quote?.Phone || ""}
                  onChange={(e) => handleChange("Phone", e.target.value)}
                  className="w-full border border-foreground/10 px-4 py-2 bg-transparent text-sm focus:outline-none focus:border-foreground/30"
                />
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="border border-foreground/10 p-6">
            <h2 className="text-xs uppercase tracking-wide text-foreground/50 mb-6">Trip Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs uppercase tracking-wide text-foreground/50 block mb-2">
                  Journey Interest
                </label>
                <input
                  type="text"
                  value={quote?.Journey_Interest || ""}
                  onChange={(e) => handleChange("Journey_Interest", e.target.value)}
                  className="w-full border border-foreground/10 px-4 py-2 bg-transparent text-sm focus:outline-none focus:border-foreground/30"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-foreground/50 block mb-2">
                  Status
                </label>
                <select
                  value={quote?.Status || "NEW"}
                  onChange={(e) => handleChange("Status", e.target.value)}
                  className="w-full border border-foreground/10 px-4 py-2 bg-transparent text-sm focus:outline-none focus:border-foreground/30"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-foreground/50 block mb-2">
                  Number of Travelers
                </label>
                <input
                  type="number"
                  min="1"
                  value={quote?.Number_Travelers || ""}
                  onChange={(e) => handleChange("Number_Travelers", e.target.value)}
                  className="w-full border border-foreground/10 px-4 py-2 bg-transparent text-sm focus:outline-none focus:border-foreground/30"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-foreground/50 block mb-2">
                  Days
                </label>
                <input
                  type="number"
                  min="1"
                  value={quote?.Days || ""}
                  onChange={(e) => handleChange("Days", e.target.value)}
                  className="w-full border border-foreground/10 px-4 py-2 bg-transparent text-sm focus:outline-none focus:border-foreground/30"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-foreground/50 block mb-2">
                  Budget (€)
                </label>
                <input
                  type="number"
                  min="0"
                  value={quote?.Budget || ""}
                  onChange={(e) => handleChange("Budget", e.target.value)}
                  className="w-full border border-foreground/10 px-4 py-2 bg-transparent text-sm focus:outline-none focus:border-foreground/30"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="border border-foreground/10 p-6">
            <h2 className="text-xs uppercase tracking-wide text-foreground/50 mb-6">Message</h2>
            <textarea
              rows={4}
              value={quote?.Message || ""}
              onChange={(e) => handleChange("Message", e.target.value)}
              className="w-full border border-foreground/10 px-4 py-2 bg-transparent text-sm focus:outline-none focus:border-foreground/30 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link
              href="/quotes"
              className="text-xs uppercase tracking-wide border border-foreground/20 px-6 py-3 hover:border-foreground transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="text-xs uppercase tracking-wide bg-foreground text-background px-6 py-3 hover:bg-foreground/80 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
