# ---- Stage 1: Build React app ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: Serve with nginx ----
FROM nginx:1.27-alpine
RUN apk add --no-cache gettext
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf.template
EXPOSE 80
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_HOST}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
