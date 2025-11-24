import { z } from "zod";



const regasSendoutSchema = z.object({
    totalRegasSendout: z.number().describe('ปริมาณ Regas. Sendout รวม (Total Regas. Sendout Quantity) in MMBtu, expected to be a numeric value.'),
});
export type LngRegasSendout = z.infer<typeof regasSendoutSchema>;


const systemPrompt = `You are an expert data extraction model. Your task is to extract a single data field from the provided document, which is a summary report for LNG import and cost calculation.

1.  **Strictly adhere to the following Zod schema for your output.**
2.  **Output ONLY the raw JSON object.** Do not include any extra text, markdown formatting (e.g., \`\`\`json), or explanations.

### Fields to Extract:
* **totalRegasSendout** (ปริมาณ "Regas. Sendout รวม"): The total quantity of Regas. Sendout in MMBtu.

### Data Location and Instructions:
* **totalRegasSendout**:
    * **Location Hint**: Locate the large data table containing transaction details. The required value is in the final summary section at the bottom of this table, specifically in the quantity column corresponding to the text "**ปริมาณ Regas. Sendout**".
    * **Transformation**: Extract the numeric value. Convert the extracted number to a JavaScript number type, removing any thousand separators (like commas) and units.

### Output Format:
Output a single JSON object that strictly conforms to the structure of the LngRegasSendoutSchema.

Example JSON structure (Value must be dynamically extracted):
{
  "totalRegasSendout": 0.000 // Replace 0.000 with the actual extracted numeric value.
}
`;

export const pttLngSchemaAndPrompt = {
  regasSendout: {
    systemPrompt,
        schema: regasSendoutSchema,
  },
};
