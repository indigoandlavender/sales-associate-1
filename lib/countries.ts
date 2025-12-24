// Country configurations for Sales Associate
// Each country has its own Google Sheet

export interface CountryConfig {
  id: string;
  name: string;
  sheetId: string;
  siteUrl: string;
  contactEmail: string;
  currency: string;
  clientIdPrefix: string;
}

// Country configurations - add new countries here
export const countries: Record<string, CountryConfig> = {
  "slow-morocco": {
    id: "slow-morocco",
    name: "Slow Morocco",
    sheetId: process.env.SLOW_MOROCCO_SHEET_ID || "",
    siteUrl: "https://slowmorocco.com",
    contactEmail: "hello@slowmorocco.com",
    currency: "EUR",
    clientIdPrefix: "SM",
  },
  "slow-namibia": {
    id: "slow-namibia",
    name: "Slow Namibia",
    sheetId: process.env.SLOW_NAMIBIA_SHEET_ID || "",
    siteUrl: "https://slownamibia.com",
    contactEmail: "hello@slownamibia.com",
    currency: "EUR",
    clientIdPrefix: "SN",
  },
  "slow-turkiye": {
    id: "slow-turkiye",
    name: "Slow Türkiye",
    sheetId: process.env.SLOW_TURKIYE_SHEET_ID || "",
    siteUrl: "https://slowturkiye.com",
    contactEmail: "hello@slowturkiye.com",
    currency: "EUR",
    clientIdPrefix: "ST",
  },
  "slow-tunisia": {
    id: "slow-tunisia",
    name: "Slow Tunisia",
    sheetId: process.env.SLOW_TUNISIA_SHEET_ID || "",
    siteUrl: "https://slowtunisia.com",
    contactEmail: "hello@slowtunisia.com",
    currency: "EUR",
    clientIdPrefix: "STU",
  },
  "slow-mauritius": {
    id: "slow-mauritius",
    name: "Slow Mauritius",
    sheetId: process.env.SLOW_MAURITIUS_SHEET_ID || "",
    siteUrl: "https://slowmauritius.com",
    contactEmail: "hello@slowmauritius.com",
    currency: "EUR",
    clientIdPrefix: "SMU",
  },
};

export function getCountryConfig(siteId: string): CountryConfig | null {
  return countries[siteId] || null;
}

export function getCountryByPrefix(prefix: string): CountryConfig | null {
  return Object.values(countries).find((c) => c.clientIdPrefix === prefix) || null;
}

export function getAllCountries(): CountryConfig[] {
  return Object.values(countries);
}
