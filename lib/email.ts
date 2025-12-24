import { Resend } from "resend";
import { getCountryConfig, CountryConfig } from "./countries";

// Single Resend client for testing (all emails from hello@slowmorocco.com)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Test mode: all emails come from hello@slowmorocco.com
const TEST_FROM_EMAIL = "Slow World <hello@slowmorocco.com>";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Send email (test mode: all from hello@slowmorocco.com)
export async function sendEmail(
  siteId: string,
  options: EmailOptions
): Promise<boolean> {
  if (!resend) {
    console.error("Resend API key not configured");
    return false;
  }

  const config = getCountryConfig(siteId);
  if (!config) {
    console.error(`Unknown site: ${siteId}`);
    return false;
  }

  try {
    // In test mode, all emails come from hello@slowmorocco.com
    // In production, use: `${config.name} <${config.contactEmail}>`
    await resend.emails.send({
      from: TEST_FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

// Send acknowledgment email to guest
export async function sendAcknowledgmentEmail(
  siteId: string,
  data: {
    firstName: string;
    email: string;
    journey: string;
    month: string;
    year: string;
    travelers: string;
    days: string;
  }
): Promise<boolean> {
  const config = getCountryConfig(siteId);
  if (!config) return false;

  return sendEmail(siteId, {
    to: data.email,
    subject: `We've received your journey request`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: normal; margin-bottom: 30px;">Dear ${data.firstName},</h1>
        
        <p style="line-height: 1.8; color: #333;">Thank you for your interest in exploring with us. We've received your journey request and are reviewing it now.</p>
        
        <div style="background: #f9f7f4; padding: 24px; margin: 30px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Journey Interest:</strong> ${data.journey}</p>
          <p style="margin: 0 0 10px 0;"><strong>Travel Dates:</strong> ${data.month} ${data.year}</p>
          <p style="margin: 0 0 10px 0;"><strong>Travelers:</strong> ${data.travelers}</p>
          <p style="margin: 0;"><strong>Duration:</strong> ${data.days} days</p>
        </div>
        
        <p style="line-height: 1.8; color: #333;">We'll be in touch within 24 hours with next steps.</p>
        
        <p style="line-height: 1.8; color: #333; margin-top: 40px;">Warm regards,<br>The ${config.name} Team</p>
      </div>
    `,
  });
}

// Send missing info request email to guest
export async function sendMissingInfoEmail(
  siteId: string,
  data: {
    firstName: string;
    email: string;
    clientId: string;
    missingFields: string[];
  }
): Promise<boolean> {
  const config = getCountryConfig(siteId);
  if (!config) return false;

  const fieldLabels: Record<string, string> = {
    days: "How many days you'd like to travel",
    startCity: "Which city you'd like to start from",
    endCity: "Which city you'd like to end in",
    travelers: "Number of travelers",
    month: "When you're thinking of traveling",
    year: "Which year",
  };

  const missingList = data.missingFields
    .map((f) => fieldLabels[f] || f)
    .map((f) => `<li style="margin-bottom: 8px;">${f}</li>`)
    .join("");

  return sendEmail(siteId, {
    to: data.email,
    subject: `A few more details needed for your journey`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: normal; margin-bottom: 30px;">Dear ${data.firstName},</h1>
        
        <p style="line-height: 1.8; color: #333;">Thank you for your journey request. To prepare a personalized itinerary for you, we need a bit more information:</p>
        
        <ul style="background: #f9f7f4; padding: 24px 24px 24px 40px; margin: 30px 0;">
          ${missingList}
        </ul>
        
        <p style="line-height: 1.8; color: #333;">Simply reply to this email with these details, and we'll get started on your itinerary.</p>
        
        <p style="line-height: 1.8; color: #333; margin-top: 40px;">Warm regards,<br>The ${config.name} Team</p>
      </div>
    `,
  });
}

// Send draft itinerary to guest
export async function sendDraftItineraryEmail(
  siteId: string,
  data: {
    firstName: string;
    email: string;
    clientId: string;
    proposalUrl: string;
  }
): Promise<boolean> {
  const config = getCountryConfig(siteId);
  if (!config) return false;

  return sendEmail(siteId, {
    to: data.email,
    subject: `Your draft itinerary is ready`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: normal; margin-bottom: 30px;">Dear ${data.firstName},</h1>
        
        <p style="line-height: 1.8; color: #333;">We've prepared a draft itinerary based on your preferences. This is just a starting point — we're happy to adjust anything to better match your vision.</p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${data.proposalUrl}" style="background: #1a1a1a; color: #fff; padding: 16px 32px; text-decoration: none; display: inline-block; font-size: 14px; letter-spacing: 0.1em;">VIEW YOUR ITINERARY</a>
        </div>
        
        <p style="line-height: 1.8; color: #333;">Let us know what you think. You can request changes directly from the itinerary page, or simply reply to this email.</p>
        
        <p style="line-height: 1.8; color: #333; margin-top: 40px;">Warm regards,<br>The ${config.name} Team</p>
      </div>
    `,
  });
}

// Send approval request to admin (you)
export async function sendApprovalRequestEmail(
  siteId: string,
  data: {
    clientId: string;
    clientName: string;
    proposalSummary: string;
    approveUrl: string;
    rejectUrl: string;
  }
): Promise<boolean> {
  const config = getCountryConfig(siteId);
  if (!config) return false;

  const adminEmail = process.env.ADMIN_EMAIL || config.contactEmail;

  return sendEmail(siteId, {
    to: adminEmail,
    from: `Sales Associate <noreply@${config.contactEmail.split("@")[1]}>`,
    subject: `[Approval Needed] ${data.clientName} (${data.clientId})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 20px; margin-bottom: 24px;">Proposal Ready for Approval</h1>
        
        <div style="background: #f5f5f5; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0;"><strong>Client:</strong> ${data.clientName}</p>
          <p style="margin: 0 0 8px 0;"><strong>ID:</strong> ${data.clientId}</p>
          <p style="margin: 0 0 8px 0;"><strong>Country:</strong> ${config.name}</p>
        </div>
        
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; margin-bottom: 12px;">Proposal Summary:</h3>
          <p style="line-height: 1.6; color: #333;">${data.proposalSummary}</p>
        </div>
        
        <div style="display: flex; gap: 16px;">
          <a href="${data.approveUrl}" style="background: #22c55e; color: #fff; padding: 14px 28px; text-decoration: none; display: inline-block; font-size: 14px; font-weight: 500;">APPROVE</a>
          <a href="${data.rejectUrl}" style="background: #ef4444; color: #fff; padding: 14px 28px; text-decoration: none; display: inline-block; font-size: 14px; font-weight: 500;">REJECT</a>
        </div>
        
        <p style="margin-top: 24px; font-size: 13px; color: #666;">Click Approve to send the proposal with payment link to the client.</p>
      </div>
    `,
  });
}

// Send final proposal with PayPal link to guest
export async function sendProposalWithPaymentEmail(
  siteId: string,
  data: {
    firstName: string;
    email: string;
    clientId: string;
    proposalUrl: string;
    paypalUrl: string;
    totalAmount: string;
    currency: string;
  }
): Promise<boolean> {
  const config = getCountryConfig(siteId);
  if (!config) return false;

  return sendEmail(siteId, {
    to: data.email,
    subject: `Your journey is ready to book`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: normal; margin-bottom: 30px;">Dear ${data.firstName},</h1>
        
        <p style="line-height: 1.8; color: #333;">Great news — your itinerary has been finalized and is ready to book.</p>
        
        <div style="background: #f9f7f4; padding: 24px; margin: 30px 0; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Total Amount</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold;">${data.currency} ${data.totalAmount}</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${data.proposalUrl}" style="color: #1a1a1a; text-decoration: underline; display: block; margin-bottom: 16px;">View Your Itinerary</a>
          <a href="${data.paypalUrl}" style="background: #1a1a1a; color: #fff; padding: 16px 32px; text-decoration: none; display: inline-block; font-size: 14px; letter-spacing: 0.1em;">SECURE YOUR JOURNEY</a>
        </div>
        
        <p style="line-height: 1.8; color: #333;">Once payment is received, we'll send you a confirmation with next steps.</p>
        
        <p style="line-height: 1.8; color: #333; margin-top: 40px;">Warm regards,<br>The ${config.name} Team</p>
      </div>
    `,
  });
}

// Send payment confirmation to guest
export async function sendPaymentConfirmationEmail(
  siteId: string,
  data: {
    firstName: string;
    email: string;
    clientId: string;
    amount: string;
    currency: string;
  }
): Promise<boolean> {
  const config = getCountryConfig(siteId);
  if (!config) return false;

  return sendEmail(siteId, {
    to: data.email,
    subject: `Payment received — your journey is confirmed`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: normal; margin-bottom: 30px;">Dear ${data.firstName},</h1>
        
        <p style="line-height: 1.8; color: #333;">Thank you! We've received your payment of ${data.currency} ${data.amount}.</p>
        
        <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 24px; margin: 30px 0; text-align: center;">
          <p style="margin: 0; color: #166534; font-size: 18px;">✓ Your journey is confirmed</p>
        </div>
        
        <p style="line-height: 1.8; color: #333;">We'll be in touch shortly with detailed information about your upcoming adventure.</p>
        
        <p style="line-height: 1.8; color: #333; margin-top: 40px;">Warm regards,<br>The ${config.name} Team</p>
      </div>
    `,
  });
}
