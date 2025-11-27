import { Effect } from "effect";
import Elysia, { t } from "elysia";
import { ExtractPDFService } from "../../extract-pdf.service";
import { elysiaPdf } from "../../helpers";
import { Runtime } from "../../runtime";
import { pttInventorySchemaAndPrompt } from "../../schema/ptt/inventory";

export const inventoryRoutes = new Elysia().group("/inventory", (c) =>
  c.post(
    "/terminal-cost",
    async ({ body }) => {
      const file = body.file;
      const arrBuf = await file.arrayBuffer();
      const buf = Buffer.from(arrBuf);

      const result = await Effect.all({
        svc: ExtractPDFService,
      }).pipe(
        Effect.andThen(({ svc }) =>
          svc.processInline(
            buf,
            pttInventorySchemaAndPrompt.terminalCost.systemPrompt,
            pttInventorySchemaAndPrompt.terminalCost.schema
          )
        ),
        Runtime.runPromise
      );

      return result;
    },
    {
      body: t.Object({
        file: elysiaPdf,
      }),
      tags: ["PTT"],
    }
  )
);
