import { z } from "zod";



const regasSendoutSchema = z.object({
  total_regas_sendout: z.number().describe('ปริมาณ Regas. Sendout รวม (Total Regas. Sendout Quantity) in MMBtu, expected to be a numeric value.'),
});
export type LngRegasSendout = z.infer<typeof regasSendoutSchema>;


const regasSendoutSystemPrompt = `You are an expert data extraction model. Your task is to extract a single data field from the provided document, which is a summary report for LNG import and cost calculation.

1.  **Strictly adhere to the following Zod schema for your output.**
2.  **Output ONLY the raw JSON object.** Do not include any extra text, markdown formatting (e.g., \`\`\`json), or explanations.

### Fields to Extract:
* **total_regas_sendout** (ปริมาณ "Regas. Sendout รวม"): The total quantity of Regas. Sendout in MMBtu.

### Data Location and Instructions:
* **total_regas_sendout**:
    * **Location Hint**: Locate the large data table containing transaction details. The required value is in the final summary section at the bottom of this table, specifically in the quantity column corresponding to the text "**ปริมาณ Regas. Sendout**".
    * **Transformation**: Extract the numeric value. Convert the extracted number to a JavaScript number type, removing any thousand separators (like commas) and units.

### Output Format:
Output a single JSON object that strictly conforms to the structure of the LngRegasSendoutSchema.

Example JSON structure (Value must be dynamically extracted):
{
  "total_regas_sendout": 0.000 // Replace 0.000 with the actual extracted numeric value.
}
`;

const LngRegasValueSchema = z.object({
  total_regas_value: z.number().describe('มูลค่าเนื้อ Regas LNG ทั้งหมด (Total Value of Regas LNG) in Baht, expected to be a numeric value.'),
});

export type LngRegasValue = z.infer<typeof LngRegasValueSchema>;


const regasValueSystemPrompt = `You are an expert data extraction model. Your task is to extract a single data field from the provided document, which is a summary report for LNG import and cost calculation.

1.  **Strictly adhere to the following Zod schema for your output.**
2.  **Output ONLY the raw JSON object.** Do not include any extra text, markdown formatting (e.g., \`\`\`json), or explanations.

### Fields to Extract:
* **total_regas_value** (มูลค่าเนื้อ Regas LNG ทั้งหมด): The total monetary value of the Regasified LNG in Baht.

### Data Location and Instructions:
* **total_regas_value**:
    * **Location Hint**: Locate the **final summary box/table** at the **bottom right corner** of the page. The field you are looking for is explicitly labeled "**มูลค่าเนื้อ Regas LNG ทั้งหมด**".
    * **Transformation**: Extract the numeric value (which is currently **5,447,307,387.79** in the sample file but will vary in other files). Convert the extracted number to a JavaScript number type, removing any thousand separators (like commas) and units (like 'บาท'). The value must be precise to two decimal places.

### Output Format:
Output a single JSON object that strictly conforms to the structure of the LngRegasValueSchema.

Example JSON structure (Value must be dynamically extracted):
{
  "total_regas_value": 0.00 // Replace 0.00 with the actual extracted numeric value.
}
`;

export const pttLngSchemaAndPrompt = {
  regasSendout: {
    systemPrompt: regasSendoutSystemPrompt,
        schema: regasSendoutSchema,
  },
  regasValue: {
    systemPrompt: regasValueSystemPrompt,
    schema: LngRegasValueSchema,
  }
};
