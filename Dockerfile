# Use Bun's official slim image as the base
FROM oven/bun:latest

# Metadata
LABEL maintainer="Nas <nas@limogi.ai>"
LABEL version="1.2.0"
LABEL description="IBS Care API V1 powered by Hono and Bun"

# Set the working directory
WORKDIR /app

# Copy project files
COPY package.json bun.lock tsconfig.json ./
COPY src ./src


# Install dependencies
RUN bun install --production

# Expose the port defined in the container (4433 by default)
EXPOSE 4433

# Start the server
CMD ["bun", "run", "start"]
