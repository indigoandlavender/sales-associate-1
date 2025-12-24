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
  Number_Travelers: string;
  Days: string;
  Budget: string;
  site_id: string;
  site_name: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const res = await fetch("/api/quotes");
        const data = await res.json();
        if (data.success) {
          setQuotes(data.quotes);
        }
      } catch (err) {
        console.error("Error fetching quotes:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuotes();
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

  // Get unique countries for filter
  const countries = [...new Set(quotes.map((q) => q.site_id))];

  // Apply filters
  const filteredQuotes = quotes.filter((q) => {
    if (filter !== "all" && q.Status !== filter) return false;
    if (countryFilter !== "all" && q.site_id !== countryFilter) return false;
    return true;
  });

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
        <h1 className="text-2xl font-semibold">Quotes</h1>
        <div className="flex gap-4">
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c.replace("slow-", "").charAt(0).toUpperCase() +
                  c.replace("slow-", "").slice(1)}
              </option>
            ))}
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ITINERARY_READY">Itinerary Ready</option>
            <option value="PRICED">Priced</option>
            <option value="SENT_TO_CLIENT">Sent to Client</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
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
                <th className="px-6 py-3 font-medium">Travelers</th>
                <th className="px-6 py-3 font-medium">Days</th>
                <th className="px-6 py-3 font-medium">Budget</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    No quotes found.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.Client_ID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">
                      {quote.Client_ID}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">
                          {quote.First_Name} {quote.Last_Name}
                        </p>
                        <p className="text-sm text-gray-500">{quote.Email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
                        {quote.site_name || quote.site_id?.replace("slow-", "")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {quote.Journey_Interest || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {quote.Number_Travelers || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {quote.Days || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {quote.Budget ? `€${parseInt(quote.Budget).toLocaleString()}` : "-"}
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
      
      <p className="mt-4 text-sm text-gray-500">
        Showing {filteredQuotes.length} of {quotes.length} quotes
      </p>
    </div>
  );
}
