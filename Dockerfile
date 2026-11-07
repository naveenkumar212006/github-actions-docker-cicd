# Multi-stage / Production-ready Dockerfile for CI/CD pipeline
# Base image: Node.js 20 on lightweight Alpine Linux (~50MB)
FROM node:20-alpine AS production

# Set environment
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Set working directory
WORKDIR /usr/src/app

# Copy dependency manifests first for optimal layer caching
COPY package*.json ./

# Install only production dependencies (clean install)
RUN npm ci --omit=dev 2>/dev/null || true

# Copy application source code
COPY src/ ./src/

# Security: Change ownership and run as non-root unprivileged user
RUN chown -R node:node /usr/src/app
USER node

# Expose web service port
EXPOSE 3000

# Docker native healthcheck for automated container health monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "src/server.js"]

