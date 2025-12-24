// Validation utilities for quote completeness

export interface QuoteData {
  Client_ID: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Journey_Interest: string;
  Start_Date: string;
  Days: string;
  Number_Travelers: string;
  Budget: string;
  Start_City: string;
  End_City: string;
  Journey_Type: string;
  [key: string]: any;
}

export interface ValidationResult {
  isComplete: boolean;
  missingFields: string[];
  canGenerateItinerary: boolean;
}

// Fields required to generate an itinerary
const REQUIRED_FOR_ITINERARY = [
  "Email",
  "First_Name",
  "Days",
  "Number_Travelers",
  "Journey_Interest",
];

// Fields that are nice to have but can be inferred or defaulted
const OPTIONAL_BUT_HELPFUL = [
  "Start_City",
  "End_City",
  "Journey_Type",
  "Budget",
  "Language",
];

// Check if a quote has all required fields
export function validateQuote(quote: Partial<QuoteData>): ValidationResult {
  const missingFields: string[] = [];

  // Check required fields
  for (const field of REQUIRED_FOR_ITINERARY) {
    const value = quote[field];
    if (!value || String(value).trim() === "") {
      missingFields.push(field);
    }
  }

  // Special check for days - must be a number
  if (quote.Days && isNaN(parseInt(quote.Days))) {
    missingFields.push("Days");
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    canGenerateItinerary: missingFields.length === 0,
  };
}

// Map internal field names to user-friendly labels
export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    Email: "Email address",
    First_Name: "First name",
    Last_Name: "Last name",
    Days: "Number of days",
    Number_Travelers: "Number of travelers",
    Journey_Interest: "Journey interest",
    Start_City: "Starting city",
    End_City: "Ending city",
    Journey_Type: "Type of journey (Desert, Coast, Mountains, etc.)",
    Budget: "Budget",
    Language: "Preferred guide language",
    Start_Date: "Travel dates",
  };

  return labels[field] || field;
}

// Get user-friendly missing fields list
export function getMissingFieldLabels(missingFields: string[]): string[] {
  return missingFields.map(getFieldLabel);
}

// Infer journey type from journey interest
export function inferJourneyType(journeyInterest: string): string {
  const interest = journeyInterest.toLowerCase();

  if (interest.includes("sahara") || interest.includes("desert") || interest.includes("dunes")) {
    return "Desert";
  }
  if (interest.includes("coast") || interest.includes("essaouira") || interest.includes("beach")) {
    return "Coast";
  }
  if (interest.includes("atlas") || interest.includes("mountain") || interest.includes("trek")) {
    return "Mountains";
  }
  if (interest.includes("imperial") || interest.includes("cities") || interest.includes("fes") || interest.includes("marrakech")) {
    return "Imperial Cities";
  }
  if (interest.includes("rif") || interest.includes("chefchaouen") || interest.includes("north")) {
    return "Northern";
  }

  return "Mixed"; // Default
}

// Infer start/end cities from journey interest
export function inferCities(journeyInterest: string): { start: string; end: string } {
  const interest = journeyInterest.toLowerCase();

  // Most journeys start and end in Marrakech
  let start = "Marrakech";
  let end = "Marrakech";

  // Check for specific patterns
  if (interest.includes("fes to") || interest.includes("from fes")) {
    start = "Fes";
  }
  if (interest.includes("to fes") || interest.includes("ending in fes")) {
    end = "Fes";
  }
  if (interest.includes("casablanca")) {
    if (interest.includes("from casablanca")) {
      start = "Casablanca";
    } else {
      end = "Casablanca";
    }
  }
  if (interest.includes("tangier")) {
    if (interest.includes("from tangier")) {
      start = "Tangier";
    } else {
      end = "Tangier";
    }
  }

  return { start, end };
}

// Infer hospitality level from budget
export function inferHospitalityLevel(budget: string | number): string {
  const numBudget = typeof budget === "string" ? parseInt(budget) : budget;

  if (isNaN(numBudget)) return "BOUTIQUE"; // Default

  if (numBudget < 2000) return "ESSENTIALS";
  if (numBudget < 5000) return "BOUTIQUE";
  return "SIGNATURE";
}
