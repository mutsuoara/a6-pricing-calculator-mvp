FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY packages/calculator-types/package.json ./packages/calculator-types/
COPY packages/calculator-core/package.json ./packages/calculator-core/
COPY packages/calculator-ui/package.json ./packages/calculator-ui/
COPY apps/standalone-webapp/package.json ./apps/standalone-webapp/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY packages/calculator-types ./packages/calculator-types
COPY packages/calculator-core ./packages/calculator-core
COPY packages/calculator-ui ./packages/calculator-ui
COPY apps/standalone-webapp ./apps/standalone-webapp

# Build packages
RUN yarn workspace @pricing-calculator/types build
RUN yarn workspace @pricing-calculator/core build
RUN yarn workspace @pricing-calculator/ui build
RUN yarn workspace pricing-calculator-webapp build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/apps/standalone-webapp/dist /usr/share/nginx/html
COPY apps/standalone-webapp/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

