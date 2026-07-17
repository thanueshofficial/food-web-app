# ---- Forkful food-ordering app ----
# Static site (HTML/CSS/JS) served by nginx.

FROM nginx:1.27-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy our custom nginx config (adds SPA-friendly fallbacks & caching headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy site files
COPY index.html menu.html cart.html billing.html /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

# Non-root friendly: nginx:alpine already drops privileges for worker processes
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
