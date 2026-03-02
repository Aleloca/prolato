# Remix Dockerfile

Dockerfile template for Remix projects (SSR with remix-serve).

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
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm ci --only=production
EXPOSE 3000
ENV PORT=3000
CMD ["npx", "remix-serve", "build/server/index.js"]
```

## Notes

- Replace `{NODE_VERSION}` with the detected Node version (default: `22`).
- If the project uses a custom server (e.g., Express adapter), adjust the CMD to use the custom server entry point instead of `remix-serve`.
- Remix v2+ uses `build/server/index.js` as the default server entry. For older versions, check `remix.config.js` for the server build path.
