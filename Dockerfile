# Stage 1: Build Frontend
FROM node:22-bookworm-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

COPY frontend/ ./
# Build the Vite project into dist/
RUN npm run build


# Stage 2: Production Backend & Monolith Server
FROM node:22-bookworm-slim

# Install Chromium and required dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    default-mysql-client \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use the installed Chromium and skip downloading its own
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app/backend

# Install backend dependencies
COPY backend/package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy backend source code
COPY backend/ ./

# Copy built frontend from Stage 1 into the location expected by server.js
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose backend API / static server port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
