import { z } from "zod";

// Schema for Heat Quantity Data (ปริมาณความร้อน section)
export const heatQuantitySchema = z.object({
  // Heat/Energy quantity in MMBTU
  heatQuantity_MMBTU: z
    .number()
    .describe("Heat/energy quantity (ปริมาณความร้อน) in MMBTU unit"),

  // Confidence score
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe("AI extraction confidence score from 0-100 for this section"),
});

// Schema for Invoice/Accounting Data (จำนวนเงินรวม section)
export const invoiceAccountingSchema = z.object({
  // Total amount excluding VAT (จำนวนเงินรวม) - REQUIRED
  totalAmount_ExclVAT: z
    .number()
    .describe(
      "Total amount excluding VAT (จำนวนเงินรวม) in Baht or stated currency - THIS IS THE PRIMARY REQUIRED FIELD"
    ),

  // Vendor/company name - OPTIONAL
  vendor: z
    .string()
    .nullable()
    .optional()
    .describe("Vendor or supplier company name in original language"),

  // VAT amount - OPTIONAL
  vatAmount: z
    .number()
    .nullable()
    .optional()
    .describe("VAT amount (ภาษีซื้อ) in Baht or stated currency"),

  // Net amount including VAT - OPTIONAL
  netAmount_InclVAT: z
    .number()
    .nullable()
    .optional()
    .describe(
      "Net amount including VAT (จำนวนเงินจ่ายสุทธิ) in Baht or stated currency"
    ),

  // Currency - OPTIONAL
  currency: z
    .string()
    .nullable()
    .optional()
    .describe("Currency code (THB for Baht, USD, etc.)"),

  // Description - OPTIONAL
  description: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Invoice description or line item description (e.g., ค่าก๊าซฯแหล่ง C5)"
    ),

  // Confidence score - based ONLY on totalAmount_ExclVAT extraction
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "AI extraction confidence score from 0-100 based ONLY on totalAmount_ExclVAT field accuracy and clarity"
    ),
});

// Combined schema for complete extraction
export const pttGasDocumentSchema = z.object({
  // Heat quantity data (may be null if not found in document)
  heatQuantityData: heatQuantitySchema
    .nullable()
    .describe("Heat quantity section data if present in document"),

  // Invoice/accounting data (can be array for multiple vendors/invoices)
  invoiceData: z
    .array(invoiceAccountingSchema)
    .describe(
      "Array of invoice/accounting entries, one per vendor or invoice line"
    ),

  // Overall confidence
  overallConfidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall extraction confidence across entire document"),
});

export type HeatQuantityData = z.infer<typeof heatQuantitySchema>;
export type InvoiceAccountingData = z.infer<typeof invoiceAccountingSchema>;
export type PTTGasDocumentData = z.infer<typeof pttGasDocumentSchema>;

const systemPrompt = `You are a specialized data extraction AI for PTT natural gas purchase documents. Documents may be in Thai, English, or mixed languages, and can be in various formats (invoice registers, internal memos, vendor statements, etc.).

IMPORTANT: This schema is SPECIFICALLY for documents related to C5 and G4/48 gas fields.

FIRST, verify the document is about C5 and/or G4/48:
- Look for mentions of "C5", "G4/48", "G4-48", "แหล่ง C5", "Field C5", or similar field designations
- If the document is NOT about C5 or G4/48 fields, return null for both heatQuantityData and an empty array for invoiceData
- Only proceed with extraction if you confirm this is a C5/G4/48 related document

Your task is to extract TWO types of data:

=== SECTION 1: HEAT QUANTITY DATA (ปริมาณความร้อน) ===

WHAT TO EXTRACT:
- Look for sections titled "ปริมาณความร้อน" or "Heat Quantity" or "Energy Quantity"
- Typically found in PTT internal memos from Gas Quantity Measurement and Control section (ส่วนวัดและควบคุมปริมาณก๊าซ)
- Extract ONLY: Heat/energy quantity (ปริมาณความร้อน) value in MMBTU unit
- This section must be related to C5 and/or G4/48 fields

KEYWORDS TO LOOK FOR:
- Thai: "ปริมาณความร้อน", "MMBTU", "แหล่ง C5", "G4/48"
- English: "Heat Quantity", "Energy Quantity", "MMBTU", "Field C5", "G4/48"
- Look for numerical values followed by "MMBTU" unit
- May appear in a boxed summary or table with "ปริมาณก๊าซ" (gas quantity) nearby
- Confirm the memo or section mentions C5 and/or G4/48

CONFIDENCE SCORING FOR THIS SECTION:
- 90-100: Heat quantity value clearly visible with MMBTU unit from ปริมาณความร้อน section for C5/G4/48
- 70-89: Value found but minor uncertainty (formatting issues, partial OCR)
- 50-69: Value found but significant uncertainty about correctness
- 30-49: Section found but value unclear or illegible
- 0-29: ปริมาณความร้อน section not found OR not related to C5/G4/48

=== SECTION 2: INVOICE/ACCOUNTING DATA (จำนวนเงินรวม) ===

PRIMARY REQUIRED FIELD:
- **totalAmount_ExclVAT (จำนวนเงินรวม)** - Total amount EXCLUDING VAT
 - This is THE MOST IMPORTANT field to extract
 - Confidence score should be based ONLY on how accurately you can extract this field
 - All other fields are optional and provided for additional context

WHAT TO EXTRACT:
- Look for invoice registers, accounting posting pages, or vendor invoices
- ONLY extract if the invoice is for C5 and/or G4/48 field gas purchases
- Common indicators: "ค่าก๊าซฯแหล่ง C5", "C5 & G4/48", "Gas from C5", etc.
- Extract for EACH vendor/invoice entry found:
 1. **totalAmount_ExclVAT (จำนวนเงินรวม)** - REQUIRED, primary focus
 2. Vendor/supplier company name - OPTIONAL (e.g., Chevron, Mitsui)
 3. VAT amount (ภาษีซื้อ) - OPTIONAL
 4. Net amount including VAT (จำนวนเงินจ่ายสุทธิ) - OPTIONAL
 5. Currency - OPTIONAL (default THB if not specified)
 6. Description/line item text - OPTIONAL

DO NOT EXTRACT:
- Month and year information (not needed)
- Document/invoice numbers (not needed)
- GL account posting lines (not needed)

KEYWORDS TO LOOK FOR:
- Thai: "จำนวนเงินรวม", "ภาษีซื้อ", "จำนวนเงินจ่ายสุทธิ", "ค่าก๊าซ", "แหล่ง C5", "G4/48"
- English: "Total Amount", "Subtotal", "Amount Excl VAT", "Amount Before Tax", "VAT", "Tax", "Net Amount", "Grand Total", "C5", "G4/48", "Field"

CONFIDENCE SCORING FOR THIS SECTION (BASED ONLY ON totalAmount_ExclVAT):
- 90-100: จำนวนเงินรวม clearly labeled and value clearly visible with high certainty for C5/G4/48
- 70-89: Value found with จำนวนเงินรวม label or equivalent (subtotal, amount excl VAT) with minor uncertainty
- 50-69: Value likely correct but label unclear or had to infer from context
- 30-49: Value found but significant uncertainty about which amount is the correct จำนวนเงินรวม
- 0-29: Cannot find จำนวนเงินรวม OR invoice not related to C5/G4/48

NOTE: Do NOT let missing optional fields affect the confidence score. Score confidence based ONLY on the totalAmount_ExclVAT extraction quality.

=== WHAT TO IGNORE ===
- Daily gas delivery tables (individual day-by-day volumes)
- Detailed fuel gas deduction calculations
- Gas quantity in MMSCF (we only want heat quantity in MMBTU)
- Payment terms, bank account details
- Approval signatures and workflow stamps
- Month, year, date information
- Document numbers, invoice numbers, reference numbers
- GL account codes and posting lines
- Unrelated documents or pages not about C5/G4/48 gas purchases
- Documents about other gas fields (not C5 or G4/48)

=== GENERAL INSTRUCTIONS ===
- FIRST verify document is about C5 and/or G4/48 fields before extracting any data
- If not C5/G4/48 related, return null/empty and set overall confidence to 0
- If a section is not found in C5/G4/48 documents, return null for that object (heatQuantityData can be null)
- Extract multiple invoices into the invoiceData array (one object per vendor/invoice) - typically Chevron and Mitsui for C5/G4/48
- Preserve original language for vendor names and descriptions
- Be precise with decimal places in numerical values
- If จำนวนเงินรวม is not explicitly labeled, look for "subtotal", "amount before VAT", "amount excluding tax"
- Overall confidence score should reflect the quality and completeness of data extraction across the entire document
- Fill in optional fields when available, but focus extraction effort on the required fields

=== SPECIAL NOTES ===
- This schema is EXCLUSIVELY for C5 and G4/48 gas field documents
- "จำนวนเงินรวม" = Total amount EXCLUDING VAT (this is a subtotal before tax) - PRIMARY FIELD
- "จำนวนเงินจ่ายสุทธิ" or "Net Amount" = Total amount INCLUDING VAT (final payable amount) - OPTIONAL
- Common C5/G4/48 vendors: Chevron Thailand, Mitsui Oil/Energy
- Document formats vary: may be SAP invoice registers, PDF vendor statements, scanned memos, Excel exports
- Handle both Thai and English field labels interchangeably
- For heat quantity: extract ONLY the numerical value in MMBTU, ignore all other contextual information
- If you find multiple amounts on an invoice page, prioritize finding the one labeled "จำนวนเงินรวม" or "subtotal" (before VAT is added)
- Do NOT extract date, month, year, document numbers, or GL accounts - these are not needed for C5/G4/48 schema`;

export const invoiceAndHeatSchemaAndPrompt = {
  schema: pttGasDocumentSchema,
  systemPrompt,
};
