"use client";

import { useEffect, useState } from "react";

interface Quote {
  Client_ID: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Journey_Interest: string;
  Status: string;
  Created_Date: string;
  site_id: string;
  site_name: string;
}

interface Stats {
  totalQuotes: number;
  newQuotes: number;
  pendingProposals: number;
  awaitingPayment: number;
}

export default function Dashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalQuotes: 0,
    newQuotes: 0,
    pendingProposals: 0,
    awaitingPayment: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/quotes");
        const data = await res.json();

        if (data.success) {
          setQuotes(data.quotes.slice(0, 10)); // Latest 10

          // Calculate stats
          const allQuotes = data.quotes;
          setStats({
            totalQuotes: allQuotes.length,
            newQuotes: allQuotes.filter((q: Quote) => q.Status === "NEW").length,
            pendingProposals: allQuotes.filter((q: Quote) => 
              ["IN_PROGRESS", "ITINERARY_READY", "PRICED"].includes(q.Status)
            ).length,
            awaitingPayment: allQuotes.filter((q: Quote) => 
              q.Status === "SENT_TO_CLIENT"
            ).length,
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
      NEW: "status-new",
      IN_PROGRESS: "status-in-progress",
      ITINERARY_READY: "status-ready",
      PRICED: "status-ready",
      SENT_TO_CLIENT: "status-sent",
      PAID: "status-paid",
      CONFIRMED: "status-paid",
      CANCELLED: "status-cancelled",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-semibold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Quotes</p>
          <p className="text-3xl font-semibold">{stats.totalQuotes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">New Inquiries</p>
          <p className="text-3xl font-semibold text-blue-600">{stats.newQuotes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Pending Proposals</p>
          <p className="text-3xl font-semibold text-yellow-600">{stats.pendingProposals}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Awaiting Payment</p>
          <p className="text-3xl font-semibold text-purple-600">{stats.awaitingPayment}</p>
        </div>
      </div>

      {/* Recent Quotes */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-medium">Recent Quotes</h2>
          <a href="/quotes" className="text-sm text-blue-600 hover:underline">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Country</th>
                <th className="px-6 py-3 font-medium">Journey</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No quotes yet. They'll appear here when guests submit the form.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.Client_ID} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">
                          {quote.First_Name} {quote.Last_Name}
                        </p>
                        <p className="text-sm text-gray-500">{quote.Client_ID}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {quote.site_name || quote.site_id}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {quote.Journey_Interest || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${getStatusClass(
                          quote.Status
                        )}`}
                      >
                        {quote.Status?.replace(/_/g, " ") || "NEW"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(quote.Created_Date)}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/quotes/${quote.Client_ID}?site_id=${quote.site_id}`}
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
    </div>
  );
}
