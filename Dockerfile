FROM oven/bun:1.3.5-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose the default port
EXPOSE 6379

# Run the server
CMD ["bun", "run", "server.ts"]
