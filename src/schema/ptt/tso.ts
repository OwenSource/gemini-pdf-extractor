import { z } from "zod";

const RequestedGasVolumesSchema = z.object({
  volumeArea2KhanomMMBTU: z
    .number()
    .describe("ปริมาณก๊าซฯ บนระบบท่อฯบนฝั่งขนอม (พื้นที่ 2)"),

  volumeArea3OnshoreMMBTU: z
    .number()
    .describe("ปริมาณก๊าซฯ บนระบบท่อฯบนฝั่ง (พื้นที่ 3)"),

  volumeArea4ChanaMMBTU: z
    .number()
    .describe("ปริมาณก๊าซฯ บนระบบท่อฯบนฝั่งจะนะ (พื้นที่ 4)"),
});

export type PttRequestedGasVolumes = z.infer<typeof RequestedGasVolumesSchema>;

const systemPrompt = `You are a highly specialized data extraction system. Your task is to process the provided PDF text, which contains a table of natural gas volumes, and extract ONLY three specific data fields into a structured JSON object.

### Extraction Instructions:
1.  **Identify the Gas Volume Table:** Locate the table titled "ข้อมูลปริมาณก๊าซธรรมชาติทุกจุดจ่ายออกและค่าบริการระบบท่อส่งก๊าซธรรมชาตินอกชายฝั่ง (พื้นที่ 1)" or a similar section listing volumes by "พื้นที่" (Area).
2.  **Extract Specific Gas Volumes:** Extract the precise numeric values for gas volume in **Million BTU** for the following three areas:
    * **Area 2 (พื้นที่ 2) - ขนอม** (Field: volumeArea2KhanomMMBTU) 
    * **Area 3 (พื้นที่ 3) - บนฝั่ง** (Field: volumeArea3OnshoreMMBTU) 
    * **Area 4 (พื้นที่ 4) - จะนะ** (Field: volumeArea4ChanaMMBTU) 

### Data Transformation and Output:
* **Convert all extracted numeric values into standard integer numbers** (TypeScript \`number\` type).
* **Remove all commas (,) and any special characters** (like the asterisk '*') from the numeric values before conversion. For example, "87,753,753*" should be converted to 87753753.
* The final output **MUST** be a single, valid JSON object strictly conforming to the \`RequestedGasVolumesSchema\`.
* **DO NOT include any other data fields** outside of the three specified (Area 2, Area 3, Area 4). Do not include the report date, service charges, or other delivery points.
* Do not include any explanatory text, code fences, or markdown beyond the final JSON object.`;



const GasServiceCostDetailSchema = z.object({
  cost_type: z
    .enum(["fixed_cost_td", "variable_cost_tc"])
    .describe(
      "ประเภทค่าบริการ: fixed_cost_td (ต้นทุนคงที่) หรือ variable_cost_tc (ต้นทุนผันแปร)"
    ),


  invoice_no: z
    .string()
    .describe("เลขที่ใบแจ้งหนี้ (Invoice Number) ที่อ้างอิงถึงรายการนี้"),


  quantity_mmbtu: z.number().describe("ปริมาณก๊าซ (Quantity) ในหน่วย MMBTU"),


  unit_price_baht_mmbtu: z
    .number()
    .describe("ราคาต่อหน่วย (Unit Price) ในหน่วย บาท/MMBTU"),


  amount_baht: z.number().describe("จำนวนเงินรวม (Amount) ในหน่วยบาท"),
});

const Area1GasServiceSchema = z
  .array(GasServiceCostDetailSchema)
  .describe(
    "An array containing details for Fixed Cost (TD) and Variable Cost (TC) for Area 1."
  );

const gasCostSystemPrompt = `You are an expert data extraction model. Your task is to extract the detailed line-item information for the gas pipeline service charges.

1.  **Strictly adhere to the following Zod schema, which requires an array of exactly two records.**
2.  **Output ONLY the raw JSON object (array of two records).** Do not include any extra text, markdown formatting (e.g., \`\`\`json), or explanations.

### Data to Extract:
Extract a record for **Fixed Cost (ต้นทุนคงที่)** and one for **Variable Cost (ต้นทุนผันแปร)**. **Crucially, you must only extract data related to Area 1 (พื้นที่ 1) / Zone 1.** **Ignore all other areas (พื้นที่ 2, 3, 4, 5).**

### Fields to Extract (per record):
* **cost_type**: The fixed value "fixed_cost_td" or "variable_cost_tc".
* **invoice_no**: The corresponding invoice number.
* **quantity_mmbtu**: The quantity in MMBTU.
* **unit_price_baht_mmbtu**: The unit price (บาท/MMBTU).
* **amount_baht**: The total amount (บาท).

### Data Location and Instructions:
* **Source Location**: Search the document for the main summary table that lists service charges categorized by Zone/Area and cost type (TD/TC).
* **For Fixed Cost (TD) Area 1:** Locate the row labeled **"Zone 1 TD"** or "**ค่าบริการส่งก๊าซส่วนต้นทุนคงที่พื้นที่1**".
    * Extract the **เลขที่ใบแจ้งหนี้ (Invoice No.)** from the corresponding column for \`invoice_no\`.
    * Extract the **ปริมาณ (Quantity)** (in MMBTU) for \`quantity_mmbtu\`.
    * Extract the **อัตรา (Unit Price)** (in บาท/MMBTU) for \`unit_price_baht_mmbtu\`.
    * Extract the **จำนวนเงิน (Amount)** (in บาท) for \`amount_baht\`.
* **For Variable Cost (TC) Area 1:** Locate the row labeled **"Zone 1 TC"** or "**ค่าบริการส่งก๊าซส่วนต้นทุนผันแปรพื้นที่1**".
    * Extract the **เลขที่ใบแจ้งหนี้ (Invoice No.)** from the corresponding column for \`invoice_no\`.
    * Extract the **ปริมาณ (Quantity)** (in MMBTU) for \`quantity_mmbtu\`.
    * Extract the **อัตรา (Unit Price)** (in บาท/MMBTU) for \`unit_price_baht_mmbtu\`.
    * Extract the **จำนวนเงิน (Amount)** (in บาท) for \`amount_baht\`.
* **Transformation**: All numeric values must be converted to JavaScript number type, removing commas, and preserving decimals where present.

### Output Format:
Output a single JSON array containing exactly two objects, corresponding to the two Area 1 cost types.

Example JSON structure:
[
  {
    "cost_type": "fixed_cost_td",
    "invoice_no": "3620001276", // Dynamically extracted
    "quantity_mmbtu": 78932275, // Dynamically extracted
    "unit_price_baht_mmbtu": 12.8869, // Dynamically extracted
    "amount_baht": 1017192334.70 // Dynamically extracted
  },
  {
    "cost_type": "variable_cost_tc",
    "invoice_no": "3620001277", // Dynamically extracted
    "quantity_mmbtu": 78932275, // Dynamically extracted
    "unit_price_baht_mmbtu": 0.1996, // Dynamically extracted
    "amount_baht": 15754882.09 // Dynamically extracted
  }
]
`;

export type GasServiceCostDetail = z.infer<typeof GasServiceCostDetailSchema>;
export type Area1GasService = z.infer<typeof Area1GasServiceSchema>;

export const pttTSOSchemaAndPrompt = {
  gasAmount: {
    systemPrompt,
    schema: RequestedGasVolumesSchema,
  },
  gasCost: {
    systemPrompt: gasCostSystemPrompt,
    schema: Area1GasServiceSchema,
  }
};
