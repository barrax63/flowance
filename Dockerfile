# ────────────────────────────────────────────────────────────────────
# Stage 1 — build the static bundle with Node 24 (Alpine for size).
# ────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app

# Install deps with a clean, reproducible install first (better cache layer).
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy sources and build.
COPY . .
RUN npm run build

# ────────────────────────────────────────────────────────────────────
# Stage 2 — serve via tiny nginx image.
# ────────────────────────────────────────────────────────────────────
FROM nginx:1.30-alpine AS runtime

# Replace default config with our SPA-friendly one.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Drop the built assets into nginx's webroot.
COPY --from=build /app/dist /usr/share/nginx/html

# Run as the unprivileged nginx user (image already creates it).
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
