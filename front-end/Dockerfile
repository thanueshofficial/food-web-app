# Stage 1: Build production React application
FROM node:18-alpine AS compilation
WORKDIR /workspace
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve optimized static workspace bundle using Nginx proxy
FROM nginx:1.25-alpine
COPY --from=compilation /workspace/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]