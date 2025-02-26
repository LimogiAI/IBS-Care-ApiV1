# Use Bun's official slim image as the base
FROM oven/bun:latest

# Metadata
LABEL maintainer="Nas <nas@limogi.ai>"
LABEL version="1.1.0"
LABEL description="IBS Care API V1 powered by Hono and Bun"

# Set the working directory
WORKDIR /app

# Copy project files
COPY package.json bun.lock tsconfig.json ./
COPY src ./src

# Set environment to production
ENV NODE_ENV=production

# Install production dependencies only
RUN bun install

# Expose the port
EXPOSE 4433

# Start the server
CMD ["bun", "run", "start"]
