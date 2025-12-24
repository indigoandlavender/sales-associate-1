# Sales Associate

Central booking and proposal management system for Slow World properties.

## Overview

Sales Associate handles:
- Quote management across all Slow World countries
- Automated email flows (acknowledgment, missing info, draft itinerary, approval, payment)
- Proposal generation and approval workflow
- PayPal payment integration
- Make.com webhook endpoints

## Setup

### 1. Create GitHub Repository

```bash
# Create new repo: indigoandlavender/sales-associate
# Upload this folder as sales-associate-main.zip
```

### 2. Deploy to Vercel

1. Go to vercel.com → New Project
2. Import from GitHub: `indigoandlavender/sales-associate`
3. Add environment variables (see below)
4. Deploy

### 3. Environment Variables

Copy `.env.example` to `.env.local` for local development.

In Vercel, add these environment variables:

| Variable | Description |
|----------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_BASE64` | Base64-encoded service account JSON |
| `SLOW_MOROCCO_SHEET_ID` | Morocco Google Sheet ID |
| `SLOW_NAMIBIA_SHEET_ID` | Namibia Google Sheet ID |
| `SLOW_TURKIYE_SHEET_ID` | Türkiye Google Sheet ID |
| `SLOW_TUNISIA_SHEET_ID` | Tunisia Google Sheet ID |
| `SLOW_MAURITIUS_SHEET_ID` | Mauritius Google Sheet ID |
| `RESEND_API_KEY` | Resend API key for emails |
| `ADMIN_EMAIL` | Your notification email |
| `APPROVAL_SECRET` | Secret for approval link tokens |
| `NEXT_PUBLIC_SITE_URL` | The deployed URL |

### 4. Update Country Sites

Update each country's PlanYourTripForm to POST to Sales Associate:

```typescript
// In PlanYourTripForm.tsx, change:
apiEndpoint = "/api/plan-your-trip"

// To:
apiEndpoint = "https://your-sales-associate.vercel.app/api/webhooks/form-submission"
```

## API Endpoints

### Webhooks (for external systems)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/form-submission` | POST | Receives form submissions from country sites |
| `/api/webhooks/approval` | GET | Handles approval/rejection clicks from emails |
| `/api/webhooks/paypal` | POST | Receives PayPal payment notifications |

### Internal APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/quotes` | GET | List all quotes (filterable by site_id, status) |
| `/api/proposals` | GET | List all proposals |

## Make.com Integration

### Scenario 1: New Quote → Generate Itinerary

Trigger: Watch `/api/quotes` for new rows with Status = "NEW" and complete data
Action: Call journey algorithm, update quote, send draft email

### Scenario 2: Guest Approves → Request Admin Approval

Trigger: Quote status changes to "ITINERARY_APPROVED"
Action: Send approval email to admin

### Scenario 3: Payment Received

Trigger: PayPal IPN or manual trigger
Action: POST to `/api/webhooks/paypal`, update status, send confirmation

## File Structure

```
sales-associate/
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── quotes/page.tsx          # Quotes list
│   ├── proposals/page.tsx       # Proposals list
│   └── api/
│       ├── quotes/              # Quotes API
│       ├── proposals/           # Proposals API
│       └── webhooks/
│           ├── form-submission/ # From country sites
│           ├── approval/        # Email button clicks
│           └── paypal/          # Payment notifications
├── lib/
│   ├── countries.ts             # Country configurations
│   ├── sheets.ts                # Google Sheets operations
│   ├── email.ts                 # Email templates and sending
│   └── validation.ts            # Quote validation
└── .env.example
```

## Adding a New Country

1. Add configuration to `lib/countries.ts`
2. Add Sheet ID environment variable
3. Update the country site's form to POST here
4. Redeploy

## Security Notes

- Approval links use signed tokens (APPROVAL_SECRET)
- All webhooks validate site_id against known countries
- No authentication on admin UI yet (add if deploying publicly)
