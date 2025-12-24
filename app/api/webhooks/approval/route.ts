import { NextResponse } from "next/server";
import { getCountryConfig, getCountryByPrefix } from "@/lib/countries";
import { getRecordByField, updateRecordByField } from "@/lib/sheets";
import { sendProposalWithPaymentEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// This endpoint handles approval/rejection clicks from admin emails
// URL format: /api/webhooks/approval?action=approve&clientId=SM-2025-001&token=xxx

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action"); // "approve" or "reject"
    const clientId = searchParams.get("clientId");
    const token = searchParams.get("token"); // Simple security token
    const notes = searchParams.get("notes"); // Optional rejection notes

    // Validate required params
    if (!action || !clientId) {
      return new Response(renderHTML("Error", "Missing required parameters."), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Simple token validation (in production, use proper JWT or signed URLs)
    const expectedToken = Buffer.from(clientId + process.env.APPROVAL_SECRET || "secret")
      .toString("base64")
      .slice(0, 16);
    
    if (token !== expectedToken) {
      return new Response(renderHTML("Error", "Invalid or expired link."), {
        status: 403,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Determine site_id from client ID prefix
    const prefix = clientId.split("-")[0];
    const countryConfig = getCountryByPrefix(prefix);
    
    if (!countryConfig) {
      return new Response(renderHTML("Error", `Unknown client ID format: ${clientId}`), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    const siteId = countryConfig.id;

    // Get the proposal
    const proposal = await getRecordByField(siteId, "Proposals", "Client_ID", clientId);
    
    if (!proposal) {
      return new Response(renderHTML("Error", `Proposal not found: ${clientId}`), {
        status: 404,
        headers: { "Content-Type": "text/html" },
      });
    }

    if (action === "approve") {
      // Update proposal status
      await updateRecordByField(siteId, "Proposals", "Client_ID", clientId, {
        Status: "APPROVED",
        Approved_Date: new Date().toISOString(),
        Last_Updated: new Date().toISOString(),
      });

      // Update quote status
      await updateRecordByField(siteId, "Quotes", "Client_ID", clientId, {
        Status: "PROPOSAL_APPROVED",
        Last_Updated: new Date().toISOString(),
      });

      // Get client details from quote
      const quote = await getRecordByField(siteId, "Quotes", "Client_ID", clientId);
      
      if (quote) {
        // Generate PayPal payment link
        // TODO: Replace with actual PayPal integration
        const paypalUrl = `https://www.paypal.com/paypalme/slowmorocco/${proposal.Total_Price || "0"}EUR`;
        
        // Send proposal with payment link to guest
        await sendProposalWithPaymentEmail(siteId, {
          firstName: quote.First_Name,
          email: quote.Email,
          clientId,
          proposalUrl: proposal.Proposal_URL || `${countryConfig.siteUrl}/proposal/${clientId}`,
          paypalUrl,
          totalAmount: proposal.Total_Price || "0",
          currency: countryConfig.currency,
        });
      }

      return new Response(
        renderHTML(
          "Approved ✓",
          `Proposal ${clientId} has been approved. The client will receive their proposal with payment link shortly.`
        ),
        { headers: { "Content-Type": "text/html" } }
      );

    } else if (action === "reject") {
      // Update proposal status
      await updateRecordByField(siteId, "Proposals", "Client_ID", clientId, {
        Status: "REJECTED",
        Notes: notes || "Rejected by admin",
        Last_Updated: new Date().toISOString(),
      });

      // Update quote status
      await updateRecordByField(siteId, "Quotes", "Client_ID", clientId, {
        Status: "PROPOSAL_REJECTED",
        Notes: notes || "Proposal rejected",
        Last_Updated: new Date().toISOString(),
      });

      return new Response(
        renderHTML(
          "Rejected",
          `Proposal ${clientId} has been rejected. ${notes ? `Notes: ${notes}` : ""}`
        ),
        { headers: { "Content-Type": "text/html" } }
      );

    } else {
      return new Response(renderHTML("Error", `Unknown action: ${action}`), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

  } catch (error: any) {
    console.error("Approval webhook error:", error);
    return new Response(
      renderHTML("Error", `Something went wrong: ${error.message}`),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}

// Render a simple HTML response page
function renderHTML(title: string, message: string): string {
  const isSuccess = title.includes("✓") || title === "Approved ✓";
  const bgColor = isSuccess ? "#f0fdf4" : title === "Rejected" ? "#fef2f2" : "#fefce8";
  const textColor = isSuccess ? "#166534" : title === "Rejected" ? "#991b1b" : "#854d0e";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Sales Associate</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: #f5f5f5;
        }
        .card {
          background: white;
          padding: 48px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 400px;
        }
        .status {
          background: ${bgColor};
          color: ${textColor};
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          display: inline-block;
        }
        .message {
          color: #333;
          line-height: 1.6;
        }
        .close {
          margin-top: 24px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="status">${title}</div>
        <p class="message">${message}</p>
        <p class="close">You can close this window.</p>
      </div>
    </body>
    </html>
  `;
}
