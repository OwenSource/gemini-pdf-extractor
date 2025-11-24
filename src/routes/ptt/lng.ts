import { Effect } from "effect";
import Elysia, { t } from "elysia";
import { ExtractPDFService } from "../../extract-pdf.service";
import { elysiaPdf } from "../../helpers";
import { Runtime } from "../../runtime";
import { pttLngSchemaAndPrompt } from "../../schema/ptt/lng";

export const lngRoutes = new Elysia().group("/lng", (c) =>
  c.post(
    "/regas-sendout",
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
            pttLngSchemaAndPrompt.regasSendout.systemPrompt,
            pttLngSchemaAndPrompt.regasSendout.schema
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
