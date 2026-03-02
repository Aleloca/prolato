# SvelteKit Dockerfile (adapter-node)

Dockerfile template for SvelteKit projects using `adapter-node`.

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
CMD ["node", "build"]
```

## Notes

- Unlike Next.js standalone, the SvelteKit output with `adapter-node` requires `node_modules` at runtime. Production dependencies must be installed in the runner stage.
- Replace `{NODE_VERSION}` with the detected Node version (default: `22`).
