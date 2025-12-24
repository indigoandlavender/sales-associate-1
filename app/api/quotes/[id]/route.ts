import { NextResponse } from "next/server";
import { getRecordByField } from "@/lib/sheets";
import { getAllCountries } from "@/lib/countries";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("site_id");
    const quoteId = params.id;

    if (!quoteId) {
      return NextResponse.json(
        { success: false, error: "Missing quote ID" },
        { status: 400 }
      );
    }

    let quote = null;

    if (siteId) {
      // Search in specific country
      quote = await getRecordByField(siteId, "Quotes", "Client_ID", quoteId);
      if (quote) {
        quote.site_id = siteId;
      }
    } else {
      // Search across all countries
      const countries = getAllCountries();
      for (const country of countries) {
        quote = await getRecordByField(country.id, "Quotes", "Client_ID", quoteId);
        if (quote) {
          quote.site_id = country.id;
          break;
        }
      }
    }

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error: any) {
    console.error("Error fetching quote:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
