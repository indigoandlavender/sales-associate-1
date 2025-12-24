"use client";

import { useEffect, useState } from "react";

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

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchProposals() {
      try {
        const res = await fetch("/api/proposals");
        const data = await res.json();
        if (data.success) {
          setProposals(data.proposals);
        }
      } catch (err) {
        console.error("Error fetching proposals:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProposals();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      SENT: "bg-purple-100 text-purple-800",
      PAID: "bg-emerald-100 text-emerald-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const filteredProposals = filter === "all" 
    ? proposals 
    : proposals.filter((p) => p.Status === filter);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Proposals</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Country</th>
                <th className="px-6 py-3 font-medium">Journey</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No proposals found.
                  </td>
                </tr>
              ) : (
                filteredProposals.map((proposal) => (
                  <tr key={proposal.Client_ID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">
                      {proposal.Client_ID}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {proposal.Client_Name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
                        {proposal.site_name || proposal.site_id?.replace("slow-", "")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {proposal.Journey_Title || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {proposal.Total_Price
                        ? `€${parseInt(proposal.Total_Price).toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${getStatusClass(
                          proposal.Status
                        )}`}
                      >
                        {proposal.Status?.replace(/_/g, " ") || "DRAFT"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(proposal.Created_Date)}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/proposals/${proposal.Client_ID}?site_id=${proposal.site_id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Showing {filteredProposals.length} of {proposals.length} proposals
      </p>
    </div>
  );
}
