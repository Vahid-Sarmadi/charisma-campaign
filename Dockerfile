# ---------------------------------------
# 1) Build Stage: install deps & build static assets
# ---------------------------------------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package and lock files first (for efficient caching)
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm install

# Copy the rest of the application code
COPY . .

# If you are building Tailwind CSS locally:
# This will generate the final CSS from Tailwind
RUN npm run build:css

# ---------------------------------------
# 2) Production Stage: minimal runtime
# ---------------------------------------
FROM node:18-alpine AS production

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Copy only package files again
COPY package.json package-lock.json ./

# Install ONLY production dependencies
RUN npm install --omit=dev

# Copy relevant app files from the "builder" stage
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/views ./views
COPY --from=builder /usr/src/app/public ./public
# (If you have other top-level files to include, copy them as well)

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

#CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]
