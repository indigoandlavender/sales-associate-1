import { NextResponse } from "next/server";
import { getCountryByPrefix } from "@/lib/countries";
import { getRecordByField, updateRecordByField } from "@/lib/sheets";
import { sendPaymentConfirmationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// This endpoint receives PayPal IPN (Instant Payment Notification)
// or can be called by Make.com after detecting a PayPal payment

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Expected payload from PayPal or Make.com:
    // {
    //   clientId: "SM-2025-001",
    //   paymentId: "PAYPAL-xxx",
    //   amount: "2500",
    //   currency: "EUR",
    //   payerEmail: "customer@example.com",
    //   status: "COMPLETED"
    // }

    const { clientId, paymentId, amount, currency, status } = body;

    if (!clientId || status !== "COMPLETED") {
      return NextResponse.json({
        success: false,
        error: "Invalid payment notification",
      });
    }

    // Determine site_id from client ID prefix
    const prefix = clientId.split("-")[0];
    const countryConfig = getCountryByPrefix(prefix);

    if (!countryConfig) {
      return NextResponse.json({
        success: false,
        error: `Unknown client ID format: ${clientId}`,
      });
    }

    const siteId = countryConfig.id;

    // Get client details
    const quote = await getRecordByField(siteId, "Quotes", "Client_ID", clientId);

    if (!quote) {
      return NextResponse.json({
        success: false,
        error: `Quote not found: ${clientId}`,
      });
    }

    // Update quote status
    await updateRecordByField(siteId, "Quotes", "Client_ID", clientId, {
      Status: "PAID",
      Payment_ID: paymentId,
      Payment_Date: new Date().toISOString(),
      Last_Updated: new Date().toISOString(),
    });

    // Update proposal status
    await updateRecordByField(siteId, "Proposals", "Client_ID", clientId, {
      Status: "PAID",
      Payment_ID: paymentId,
      Payment_Date: new Date().toISOString(),
      Last_Updated: new Date().toISOString(),
    });

    // Send payment confirmation to guest
    await sendPaymentConfirmationEmail(siteId, {
      firstName: quote.First_Name,
      email: quote.Email,
      clientId,
      amount: amount || quote.Budget || "0",
      currency: currency || countryConfig.currency,
    });

    // TODO: Notify admin of successful payment
    // TODO: Create booking record
    // TODO: Trigger after-sale flow

    return NextResponse.json({
      success: true,
      clientId,
      message: "Payment confirmed and client notified",
    });

  } catch (error: any) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
