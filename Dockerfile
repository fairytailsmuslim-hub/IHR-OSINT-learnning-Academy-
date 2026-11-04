FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy full source, curriculum JSON content, and scripts
COPY . .

# Build frontend production bundle
RUN npm run build
RUN chmod +x ./scripts/start.sh

EXPOSE 3000
ENV NODE_ENV=production

CMD ["./scripts/start.sh"]
