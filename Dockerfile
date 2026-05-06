# ── Base Image ───────────────────────────────────────
FROM node:20-alpine

# Working directory inside container
WORKDIR /app

# Copy package files first (layer cache optimization)
# Only re-runs npm install if package.json changes
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose app port
EXPOSE 3000

# Health check — Docker monitors service health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the app
CMD ["node", "src/app.js"]
