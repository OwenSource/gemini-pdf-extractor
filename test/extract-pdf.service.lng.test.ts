// import path from "node:path";
// import { Effect } from "effect";
// import { describe, expect, it } from "vitest";
// import { ExtractPDFService } from "../src/extract-pdf.service";
// import { readFileAndSize } from "../src/helpers";
// import { Runtime } from "../src/runtime";
// import { pttLngSchemaAndPrompt } from "../src/schema/ptt/lng";

// const files = {
//   ptt: {
//     lng: {
//         regasSendout: path.join(
//             __dirname,
//             "PTT/PTT LNG PELNG.pdf"
//         ),
//     }
//   },
// };

// describe("extract invoice", () => {

//   it("should extract regas sendout data", async () => {
//     const { file } = await readFileAndSize(files.ptt.lng.regasSendout);
//     const program = Effect.all({
//       svc: ExtractPDFService,
//     }).pipe(
//       Effect.andThen(({ svc }) =>
//         svc.processInline(
//           file,
//           pttLngSchemaAndPrompt.regasSendout.systemPrompt,
//           pttLngSchemaAndPrompt.regasSendout.schema
//         )
//       ),
//       Effect.tap((data) => Effect.log("data", data)),
//       Effect.tapError((error) => Effect.logError("error -->", error.error))
//     );
//     const result = await Runtime.runPromise(program);

//     expect(result.totalRegasSendout).toEqual(16_007_718.629);
//   });
// });

export {};
