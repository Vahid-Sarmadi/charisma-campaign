# ---------------------------------------
# 1) Build Stage: install deps & build static assets
# ---------------------------------------
FROM docker.arvancloud.ir/node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package and lock files first (for efficient caching)
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci --prefer-offline --no-audit

# Copy the rest of the application code
COPY . .

# ---------------------------------------
# 2) Production Stage: minimal runtime
# ---------------------------------------
FROM docker.arvancloud.ir/node:20-alpine AS production

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /usr/src/app

# Copy only package files again
COPY package.json package-lock.json ./

# Install ONLY production dependencies
RUN npm ci --prefer-offline --no-audit --omit=dev && \
    npm cache clean --force

# Copy relevant app files from the "builder" stage
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/src ./src
# COPY --from=builder --chown=nodejs:nodejs /usr/src/app/views ./views
# COPY --from=builder --chown=nodejs:nodejs /usr/src/app/public ./public

# Switch to non-root user
USER nodejs

# Expose the port your app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["npm", "start"]
