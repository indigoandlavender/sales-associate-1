import { NextResponse } from "next/server";
import { getFullRowData, appendSheetData, generateClientId } from "@/lib/sheets";

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

    // Get the original row data
    const rowData = await getFullRowData(site_id, "Quotes", "Client_ID", quote_id);
    
    if (!rowData) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    const { headers, row } = rowData;

    // Generate new client ID
    const newClientId = await generateClientId(site_id);

    // Find the index of Client_ID and Created_Date columns
    const clientIdIndex = headers.indexOf("Client_ID");
    const createdDateIndex = headers.indexOf("Created_Date");
    const statusIndex = headers.indexOf("Status");

    // Create new row with updated values
    const newRow = [...row];
    
    if (clientIdIndex !== -1) {
      newRow[clientIdIndex] = newClientId;
    }
    
    if (createdDateIndex !== -1) {
      newRow[createdDateIndex] = new Date().toISOString().split("T")[0];
    }
    
    if (statusIndex !== -1) {
      newRow[statusIndex] = "NEW"; // Reset status for duplicated quote
    }

    // Append the new row
    const success = await appendSheetData(site_id, "Quotes", [newRow]);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        new_quote_id: newClientId 
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to duplicate quote" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error duplicating quote:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
