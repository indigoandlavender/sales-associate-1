import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/sheets";
import { getAllCountries } from "@/lib/countries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET - Fetch all quotes across all countries (or filtered by country)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("site_id"); // Optional filter
    const status = searchParams.get("status"); // Optional filter

    let allQuotes: any[] = [];

    if (siteId) {
      // Fetch from specific country
      const quotes = await getSheetData(siteId, "Quotes");
      allQuotes = quotes.map((q) => ({ ...q, site_id: siteId }));
    } else {
      // Fetch from all countries
      const countries = getAllCountries();
      
      for (const country of countries) {
        try {
          const quotes = await getSheetData(country.id, "Quotes");
          const quotesWithSite = quotes.map((q) => ({ 
            ...q, 
            site_id: country.id,
            site_name: country.name,
          }));
          allQuotes.push(...quotesWithSite);
        } catch (err) {
          console.error(`Error fetching quotes for ${country.id}:`, err);
          // Continue with other countries
        }
      }
    }

    // Filter out header rows and invalid entries
    const validQuotes = allQuotes.filter((q) =>
      q.Client_ID &&
      q.Client_ID !== "Client_ID" &&
      !q.Client_ID.includes(",")
    );

    // Apply status filter if provided
    const filteredQuotes = status
      ? validQuotes.filter((q) => q.Status === status)
      : validQuotes;

    // Sort by Created_Date descending (newest first)
    filteredQuotes.sort((a, b) => {
      const dateA = a.Created_Date ? new Date(a.Created_Date).getTime() : 0;
      const dateB = b.Created_Date ? new Date(b.Created_Date).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      quotes: filteredQuotes,
      count: filteredQuotes.length,
    });

  } catch (error: any) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json(
      { success: false, quotes: [], error: error.message },
      { status: 500 }
    );
  }
}
