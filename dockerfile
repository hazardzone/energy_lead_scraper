# Stage 1: Build the application
FROM node:14 AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (if applicable)
# RUN npm run build

# Stage 2: Create the production image
FROM node:14-alpine

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app ./

# Install only production dependencies
RUN npm install --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Run the application with a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the application
CMD ["npm", "start"]