import { NextResponse } from "next/server";
import { updateRecordByField } from "@/lib/sheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quote_id, site_id, updates } = body;

    if (!quote_id || !site_id) {
      return NextResponse.json(
        { success: false, error: "Missing quote_id or site_id" },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No updates provided" },
        { status: 400 }
      );
    }

    // Update the record
    const success = await updateRecordByField(
      site_id,
      "Quotes",
      "Client_ID",
      quote_id,
      updates
    );

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to update quote" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error updating quote:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
