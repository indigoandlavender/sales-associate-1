import { google } from "googleapis";
import { getCountryConfig } from "./countries";

// Initialize Google Sheets API with read/write access
async function getSheets() {
  let credentials;

  // Support both base64 encoded and individual env vars
  if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
    const decoded = Buffer.from(
      process.env.GOOGLE_SERVICE_ACCOUNT_BASE64,
      "base64"
    ).toString("utf-8");
    credentials = JSON.parse(decoded);
  } else {
    credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/spreadsheets.readonly",
    ],
  });

  return google.sheets({ version: "v4", auth });
}

// Convert rows to objects using first row as headers
function rowsToObjects(rows: any[][]): Record<string, any>[] {
  if (!rows || rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj: Record<string, any> = {};
    headers.forEach((header: string, index: number) => {
      obj[header] = row[index] || "";
    });
    return obj;
  });
}

// Get sheet data for a specific country
export async function getSheetData(
  siteId: string,
  tabName: string
): Promise<Record<string, any>[]> {
  try {
    const config = getCountryConfig(siteId);
    if (!config) {
      throw new Error(`Unknown site: ${siteId}`);
    }

    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: `${tabName}!A:ZZ`,
    });

    return rowsToObjects(response.data.values || []);
  } catch (error) {
    console.error(`Error fetching ${tabName} for ${siteId}:`, error);
    return [];
  }
}

// Append data to a sheet for a specific country
export async function appendSheetData(
  siteId: string,
  tabName: string,
  rows: any[][]
): Promise<boolean> {
  try {
    const config = getCountryConfig(siteId);
    if (!config) {
      throw new Error(`Unknown site: ${siteId}`);
    }

    const sheets = await getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.sheetId,
      range: `${tabName}!A:ZZ`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows,
      },
    });

    return true;
  } catch (error) {
    console.error(`Error appending to ${tabName} for ${siteId}:`, error);
    return false;
  }
}

// Update a specific row in a sheet
export async function updateSheetRow(
  siteId: string,
  tabName: string,
  rowIndex: number, // 1-based, where 1 is the header row
  rowData: any[]
): Promise<boolean> {
  try {
    const config = getCountryConfig(siteId);
    if (!config) {
      throw new Error(`Unknown site: ${siteId}`);
    }

    const sheets = await getSheets();
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId,
      range: `${tabName}!A${rowIndex}:ZZ${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowData],
      },
    });

    return true;
  } catch (error) {
    console.error(`Error updating row ${rowIndex} in ${tabName} for ${siteId}:`, error);
    return false;
  }
}

// Find row index by a field value (e.g., Client_ID)
export async function findRowIndex(
  siteId: string,
  tabName: string,
  fieldName: string,
  fieldValue: string
): Promise<number | null> {
  try {
    const config = getCountryConfig(siteId);
    if (!config) {
      throw new Error(`Unknown site: ${siteId}`);
    }

    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: `${tabName}!A:ZZ`,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) return null;

    const headers = rows[0];
    const fieldIndex = headers.indexOf(fieldName);
    if (fieldIndex === -1) return null;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][fieldIndex] === fieldValue) {
        return i + 1; // Return 1-based row number
      }
    }

    return null;
  } catch (error) {
    console.error(`Error finding row in ${tabName} for ${siteId}:`, error);
    return null;
  }
}

// Get a single record by field value
export async function getRecordByField(
  siteId: string,
  tabName: string,
  fieldName: string,
  fieldValue: string
): Promise<Record<string, any> | null> {
  const data = await getSheetData(siteId, tabName);
  return data.find((row) => row[fieldName] === fieldValue) || null;
}

// Update a record by field value
export async function updateRecordByField(
  siteId: string,
  tabName: string,
  fieldName: string,
  fieldValue: string,
  updates: Record<string, any>
): Promise<boolean> {
  try {
    const config = getCountryConfig(siteId);
    if (!config) {
      throw new Error(`Unknown site: ${siteId}`);
    }

    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: `${tabName}!A:ZZ`,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) return false;

    const headers = rows[0];
    const fieldIndex = headers.indexOf(fieldName);
    if (fieldIndex === -1) return false;

    // Find the row
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][fieldIndex] === fieldValue) {
        rowIndex = i;
        break;
      }
    }
    if (rowIndex === -1) return false;

    // Apply updates to the row
    const updatedRow = [...rows[rowIndex]];
    for (const [key, value] of Object.entries(updates)) {
      const colIndex = headers.indexOf(key);
      if (colIndex !== -1) {
        updatedRow[colIndex] = value;
      }
    }

    // Write back
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId,
      range: `${tabName}!A${rowIndex + 1}:ZZ${rowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [updatedRow],
      },
    });

    return true;
  } catch (error) {
    console.error(`Error updating record in ${tabName} for ${siteId}:`, error);
    return false;
  }
}

// Generate next client ID for a country
export async function generateClientId(siteId: string): Promise<string> {
  const config = getCountryConfig(siteId);
  if (!config) {
    throw new Error(`Unknown site: ${siteId}`);
  }

  const quotes = await getSheetData(siteId, "Quotes");
  const year = new Date().getFullYear();
  const prefix = `${config.clientIdPrefix}-${year}-`;

  const existingIds = quotes
    .map((q) => q.Client_ID || "")
    .filter((id: string) => id.startsWith(prefix))
    .map((id: string) => parseInt(id.replace(prefix, ""), 10))
    .filter((num: number) => !isNaN(num));

  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return `${prefix}${String(maxId + 1).padStart(3, "0")}`;
}

// Delete a row by row index
export async function deleteSheetRow(
  siteId: string,
  tabName: string,
  rowIndex: number // 1-based row number
): Promise<boolean> {
  try {
    const config = getCountryConfig(siteId);
    if (!config) {
      throw new Error(`Unknown site: ${siteId}`);
    }

    const sheets = await getSheets();
    
    // Get sheet ID for the tab
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: config.sheetId,
    });
    
    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === tabName
    );
    
    if (!sheet?.properties?.sheetId) {
      throw new Error(`Tab ${tabName} not found`);
    }

    // Delete the row using batchUpdate
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: config.sheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheet.properties.sheetId,
                dimension: "ROWS",
                startIndex: rowIndex - 1, // 0-based
                endIndex: rowIndex, // exclusive
              },
            },
          },
        ],
      },
    });

    return true;
  } catch (error) {
    console.error(`Error deleting row ${rowIndex} in ${tabName} for ${siteId}:`, error);
    return false;
  }
}

// Get full row data including headers for duplication
export async function getFullRowData(
  siteId: string,
  tabName: string,
  fieldName: string,
  fieldValue: string
): Promise<{ headers: string[]; row: any[] } | null> {
  try {
    const config = getCountryConfig(siteId);
    if (!config) {
      throw new Error(`Unknown site: ${siteId}`);
    }

    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: `${tabName}!A:ZZ`,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) return null;

    const headers = rows[0];
    const fieldIndex = headers.indexOf(fieldName);
    if (fieldIndex === -1) return null;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][fieldIndex] === fieldValue) {
        return { headers, row: rows[i] };
      }
    }

    return null;
  } catch (error) {
    console.error(`Error getting row data in ${tabName} for ${siteId}:`, error);
    return null;
  }
}
