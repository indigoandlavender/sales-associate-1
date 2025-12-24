"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Proposal {
  Client_ID: string;
  Client_Name: string;
  Journey_Title: string;
  Total_Price: string;
  Status: string;
  Created_Date: string;
  site_id: string;
  site_name: string;
}

const statusOptions = ["ALL", "DRAFT", "PENDING_APPROVAL", "APPROVED", "SENT", "PAID", "REJECTED"];

const statusColors: { [key: string]: string } = {
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING_APPROVAL: "bg-yellow-50 text-yellow-700",
  APPROVED: "bg-green-50 text-green-700",
  SENT: "bg-purple-50 text-purple-700",
  PAID: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
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

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Selected proposal for detail view
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    fetch("/api/proposals")
      .then((r) => r.json())
      .then((data) => {
        setProposals(data.proposals || []);
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

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    if (statusFilter !== "ALL" && p.Status !== statusFilter) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const name = (p.Client_Name || "").toLowerCase();
      if (!name.includes(search)) return false;
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
            <Link href="/quotes" className="text-sm text-foreground/50 hover:text-foreground transition-colors">
              QUOTES
            </Link>
            <Link href="/proposals" className="text-sm font-medium">
              PROPOSALS
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl">All Proposals</h1>
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
            placeholder="Search by client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-foreground/10 bg-transparent text-sm focus:outline-none focus:border-foreground/30 w-64"
          />
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
                    <th className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium">Total</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium">Status</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide text-foreground/50 font-medium">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProposals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-foreground/50">
                        No proposals found.
                      </td>
                    </tr>
                  ) : (
                    filteredProposals.map((proposal) => (
                      <tr 
                        key={proposal.Client_ID} 
                        className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors"
                      >
                        <td className="px-4 py-4 font-medium">
                          {proposal.Client_Name || "—"}
                        </td>
                        <td className="px-4 py-4">
                          {countryLabels[proposal.site_id] || proposal.site_id}
                        </td>
                        <td className="px-4 py-4 text-foreground/70">
                          {proposal.Journey_Title || "—"}
                        </td>
                        <td className="px-4 py-4 font-medium">
                          {proposal.Total_Price ? `€${parseInt(proposal.Total_Price).toLocaleString()}` : "—"}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2 py-1 rounded ${statusColors[proposal.Status] || "bg-gray-100 text-gray-600"}`}>
                            {proposal.Status?.replace(/_/g, " ") || "DRAFT"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-foreground/50">
                          {formatDate(proposal.Created_Date)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setSelectedProposal(proposal)}
                              className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded transition-colors"
                              title="View Details"
                            >
                              {Icons.view}
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

        <p className="mt-4 text-sm text-foreground/50">
          Showing {filteredProposals.length} of {proposals.length} proposals
        </p>
      </main>

      {/* Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setSelectedProposal(null)} />
          <div className="relative bg-background w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-foreground/10 p-6 flex items-center justify-between">
              <h2 className="font-serif text-xl">Proposal Details</h2>
              <button 
                onClick={() => setSelectedProposal(null)}
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
                <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Proposal ID</p>
                <p className="font-mono text-sm">{selectedProposal.Client_ID}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Client</p>
                  <p className="font-medium">{selectedProposal.Client_Name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Country</p>
                  <p>{countryLabels[selectedProposal.site_id] || selectedProposal.site_id}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Journey</p>
                <p>{selectedProposal.Journey_Title || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Total Price</p>
                  <p className="font-medium text-lg">
                    {selectedProposal.Total_Price ? `€${parseInt(selectedProposal.Total_Price).toLocaleString()}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Status</p>
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[selectedProposal.Status] || "bg-gray-100 text-gray-600"}`}>
                    {selectedProposal.Status?.replace(/_/g, " ") || "DRAFT"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Date</p>
                <p className="text-sm">{formatDate(selectedProposal.Created_Date)}</p>
              </div>
              <div className="pt-4 border-t border-foreground/10 space-y-3">
                <Link
                  href={`/proposals/${selectedProposal.Client_ID}/edit`}
                  className="block w-full text-center text-xs uppercase tracking-wide border border-foreground px-4 py-3 hover:bg-foreground hover:text-background transition-colors"
                >
                  Edit Proposal
                </Link>
                <button
                  className="block w-full text-center text-xs uppercase tracking-wide bg-foreground text-background px-4 py-3 hover:bg-foreground/80 transition-colors"
                >
                  Send to Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
