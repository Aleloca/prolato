# Express / Node.js Backend Dockerfile

Dockerfile template for Express, Fastify, Koa, Hono, or generic Node.js backend projects.

## Dockerfile (JavaScript)

```dockerfile
FROM node:{NODE_VERSION}-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE {PORT}
CMD ["node", "{entry_file}"]
```

Where:
- `{NODE_VERSION}` → from the `node_version` field of the report (default: `22`)
- `{PORT}` → the port detected in the code (default: `3000`)
- `{entry_file}` → the entry file (e.g., `server.js`, `index.js`, `app.js`)

## Dockerfile (TypeScript — with build step)

If the project has a `build` command in `package.json` (e.g., for TypeScript):

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
EXPOSE {PORT}
CMD ["node", "dist/{entry_file}"]
```
