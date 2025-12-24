import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/sheets";
import { getAllCountries } from "@/lib/countries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET - Fetch all proposals across all countries (or filtered)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("site_id");
    const status = searchParams.get("status");

    let allProposals: any[] = [];

    if (siteId) {
      const proposals = await getSheetData(siteId, "Proposals");
      allProposals = proposals.map((p) => ({ ...p, site_id: siteId }));
    } else {
      const countries = getAllCountries();

      for (const country of countries) {
        try {
          const proposals = await getSheetData(country.id, "Proposals");
          const proposalsWithSite = proposals.map((p) => ({
            ...p,
            site_id: country.id,
            site_name: country.name,
          }));
          allProposals.push(...proposalsWithSite);
        } catch (err) {
          console.error(`Error fetching proposals for ${country.id}:`, err);
        }
      }
    }

    // Filter out invalid entries
    const validProposals = allProposals.filter((p) =>
      p.Client_ID &&
      p.Client_ID !== "Client_ID" &&
      !p.Client_ID.includes(",")
    );

    // Apply status filter
    const filteredProposals = status
      ? validProposals.filter((p) => p.Status === status)
      : validProposals;

    // Sort by Created_Date descending
    filteredProposals.sort((a, b) => {
      const dateA = a.Created_Date ? new Date(a.Created_Date).getTime() : 0;
      const dateB = b.Created_Date ? new Date(b.Created_Date).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      proposals: filteredProposals,
      count: filteredProposals.length,
    });

  } catch (error: any) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { success: false, proposals: [], error: error.message },
      { status: 500 }
    );
  }
}
