# Astro SSR Dockerfile

Dockerfile template for Astro projects with Server-Side Rendering.

## Dockerfile

```dockerfile
FROM node:{NODE_VERSION}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:{NODE_VERSION}-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0
CMD ["node", "./dist/server/entry.mjs"]
```

## Notes

- Astro uses port 4321 in development, but in production we use port 3000 for consistency with other frameworks and with the `docker-compose.yml` template (which uses `${APP_PORT:-3000}:3000` as default). The `PORT=3000` variable is read by Astro SSR for binding.
- Replace `{NODE_VERSION}` with the detected Node version (default: `22`).
