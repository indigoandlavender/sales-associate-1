import { NextResponse } from "next/server";
import { findRowIndex, deleteSheetRow } from "@/lib/sheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quote_id, site_id } = body;

    if (!quote_id || !site_id) {
      return NextResponse.json(
        { success: false, error: "Missing quote_id or site_id" },
        { status: 400 }
      );
    }

    // Find the row index
    const rowIndex = await findRowIndex(site_id, "Quotes", "Client_ID", quote_id);
    
    if (!rowIndex) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    // Delete the row
    const success = await deleteSheetRow(site_id, "Quotes", rowIndex);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to delete quote" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error deleting quote:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
