FROM oven/bun AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build
COPY . .
RUN bun run build

FROM base AS final
COPY --from=build /app/dist dist

EXPOSE 3000

CMD [ "bun", "run", "/dist/index.js" ]