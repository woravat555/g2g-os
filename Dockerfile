# G2G OS · static site · nginx:alpine
# Mirrors NK Law deploy pattern · 256MB Fly.io region sin
# v1.1 · 2026-05-18 · Citizen full · auto-onboarding + QR + broadcast + analytics + flex welcome · cache-buster #11

FROM nginx:alpine

# Remove default config
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy static site
COPY src /usr/share/nginx/html

# Fix permissions — sandbox sync creates files with 600/700 which nginx can't read
RUN chmod -R u+rwX,go+rX /usr/share/nginx/html

# Copy our nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check (matches Fly.io [[services.http_checks]])
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O- http://localhost/ > /dev/null || exit 1

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
