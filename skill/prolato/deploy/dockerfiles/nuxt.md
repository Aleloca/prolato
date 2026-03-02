# Nuxt.js SSR Dockerfile

Dockerfile template for Nuxt.js projects with Server-Side Rendering.

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
COPY --from=builder /app/.output ./.output
EXPOSE 3000
ENV PORT=3000
CMD ["node", ".output/server/index.mjs"]
```

## Notes

- Replace `{NODE_VERSION}` with the detected Node version (default: `22`).
