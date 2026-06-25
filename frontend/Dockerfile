FROM node:20-alpine AS build

WORKDIR /app

# Accept VITE_API_URL as a build argument (passed from docker-compose)
ARG VITE_API_URL=http://localhost:8000/api/v1
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ── Production: Nginx ─────────────────────────────────────────────────────────
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
# Enable SPA routing — must copy nginx.conf so /find-universities doesn't 404 on refresh
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
