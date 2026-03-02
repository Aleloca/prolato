# Next.js SSR Dockerfile

Dockerfile template for Next.js projects with Server-Side Rendering (standalone output).

## Prerequisites

Before generating the Dockerfile, make sure `next.config.js` (or `.mjs`/`.ts`) contains `output: 'standalone'`. If not present, add it.

## Dockerfile

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

## Notes

- The `builder` stage installs ALL dependencies (including devDependencies like `next`) because they are needed for the build.
- The `runner` stage copies only the `standalone` output, which already includes the necessary production dependencies, reducing the final image size.
- Replace `22` with the detected Node version from the analysis report if different.
