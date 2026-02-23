# ---- Stage 1: Install production deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Stage 2: Runtime ----
FROM node:20-alpine
WORKDIR /app

# Copy installed modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# Pre-create upload dirs so volume mounts don't wipe them
RUN mkdir -p uploads/avatars uploads/files

# Set defaults (override via Railway env vars)
ENV CLIENT_URL=https://sparkly-phoenix-cd1706.netlify.app
ENV BACKEND_URL=https://backend-production-87c8f.up.railway.app

EXPOSE 5000
CMD ["node", "src/server.js"]
