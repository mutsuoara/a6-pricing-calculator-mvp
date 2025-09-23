FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY packages/calculator-types/package.json ./packages/calculator-types/
COPY packages/calculator-core/package.json ./packages/calculator-core/
COPY packages/calculator-api/package.json ./packages/calculator-api/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY packages/calculator-types ./packages/calculator-types
COPY packages/calculator-core ./packages/calculator-core
COPY packages/calculator-api ./packages/calculator-api

# Build packages
RUN yarn workspace @pricing-calculator/types build
RUN yarn workspace @pricing-calculator/core build
RUN yarn workspace @pricing-calculator/api build

EXPOSE 3001

CMD ["yarn", "workspace", "@pricing-calculator/api", "start"]
