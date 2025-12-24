import { NextResponse } from "next/server";
import { getCountryConfig } from "@/lib/countries";
import { appendSheetData, generateClientId } from "@/lib/sheets";
import { sendAcknowledgmentEmail, sendMissingInfoEmail } from "@/lib/email";
import { validateQuote, getMissingFieldLabels } from "@/lib/validation";

export const dynamic = "force-dynamic";

// This endpoint receives form submissions from all country sites
// Each country's PlanYourTripForm POSTs here instead of to its own API

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      site_id,
      journey,
      month,
      year,
      travelers,
      days,
      language,
      budget,
      requests,
      firstName,
      lastName,
      email,
      phone,
      countryCode,
      country,
      hearAboutUs,
    } = body;

    // Validate site_id
    const config = getCountryConfig(site_id);
    if (!config) {
      return NextResponse.json(
        { success: false, error: `Unknown site: ${site_id}` },
        { status: 400 }
      );
    }

    // Generate client ID
    const clientId = await generateClientId(site_id);

    // Calculate dates
    const createdDate = new Date().toISOString();
    const nights = parseInt(days) > 0 ? parseInt(days) - 1 : 0;

    // Calculate approximate start date from month/year
    const monthIndex = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ].indexOf(month);
    const startDate = monthIndex >= 0 
      ? `${year}-${String(monthIndex + 1).padStart(2, "0")}-15` 
      : "";

    // Build row data matching Quotes sheet columns
    const rowData = [
      clientId,                           // Client_ID
      firstName,                          // First_Name
      lastName,                           // Last_Name
      country || "",                      // Country
      email,                              // Email
      countryCode?.replace("+", "") || "",// WhatsApp_Country_Code
      phone || "",                        // WhatsApp_Number
      journey,                            // Journey_Interest
      startDate,                          // Start_Date
      "",                                 // End_Date
      days || "",                         // Days
      nights.toString(),                  // Nights
      language || "",                     // Language
      "",                                 // Hospitality_Level (to be inferred)
      "",                                 // Dream_Experience
      requests || "",                     // Requests
      hearAboutUs || "",                  // Hear_About_Us
      travelers,                          // Number_Travelers
      budget || "",                       // Budget
      "",                                 // Start_City (to be inferred or asked)
      "",                                 // End_City (to be inferred or asked)
      "",                                 // Journey_Type (to be inferred)
      "NEW",                              // Status
      "",                                 // Itinerary_Doc_Link
      "",                                 // Proposal_URL
      createdDate,                        // Created_Date
      createdDate,                        // Last_Updated
      "",                                 // Notes
    ];

    // Append to country's Google Sheet
    await appendSheetData(site_id, "Quotes", [rowData]);

    // Send acknowledgment email to guest
    await sendAcknowledgmentEmail(site_id, {
      firstName,
      email,
      journey,
      month,
      year,
      travelers,
      days: days || "flexible",
    });

    // Validate completeness
    const validation = validateQuote({
      Client_ID: clientId,
      First_Name: firstName,
      Email: email,
      Journey_Interest: journey,
      Days: days,
      Number_Travelers: travelers,
      Start_City: "", // Not collected in form
      End_City: "",   // Not collected in form
    });

    // If missing required fields, send request for more info
    if (!validation.isComplete) {
      await sendMissingInfoEmail(site_id, {
        firstName,
        email,
        clientId,
        missingFields: validation.missingFields,
      });
    }

    // TODO: If complete, trigger Make.com webhook to generate itinerary
    // This will be added when we set up Make.com

    return NextResponse.json({
      success: true,
      clientId,
      siteId: site_id,
      isComplete: validation.isComplete,
      message: validation.isComplete 
        ? "Journey request submitted successfully. Generating itinerary..."
        : "Journey request submitted. We'll follow up for more details.",
    });

  } catch (error: any) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
