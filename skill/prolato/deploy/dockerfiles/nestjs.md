# NestJS Dockerfile

Dockerfile template for NestJS projects.

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
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## Notes

- Replace `{NODE_VERSION}` with the detected Node version (default: `22`).
- NestJS compiles TypeScript to `dist/` by default. The entry point is `dist/main.js`.
- If the project uses a monorepo structure (Nx or Lerna), the build output path may differ. Check `nest-cli.json` for the `outDir` configuration.
- NestJS defaults to port `3000`. Check `main.ts` for `app.listen()` to confirm the port.
