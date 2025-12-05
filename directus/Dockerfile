FROM directus/directus:11.13.3

# Switch to root to install build dependencies
USER root

# Install build tools
RUN apk add --no-cache python3 make g++

# Copy extensions source
COPY --chown=node:node extensions /directus/extensions

# Copy migrations
COPY --chown=node:node migrations /directus/migrations

# Copy schema snapshot if it exists (for schema apply)
# Using wildcard to make this optional - won't fail if file doesn't exist
COPY --chown=node:node schema.yaml* /directus/

# Copy startup script
COPY --chown=node:node start.sh /directus/start.sh
RUN chmod +x /directus/start.sh

# Build each extension
WORKDIR /directus/extensions

# Find and build all extensions with package.json
RUN for dir in $(find . -name "package.json" -not -path "*/node_modules/*" -exec dirname {} \;); do \
      echo "Building extension in $dir"; \
      cd /directus/extensions/$dir && \
      rm -rf node_modules package-lock.json && \
      npm install --include=dev && \
      ./node_modules/.bin/directus-extension build; \
    done

# Switch back to node user
USER node
WORKDIR /directus

# Default environment variables (can be overridden)
ENV PUBLIC_URL="/"
ENV ADMIN_EMAIL="admin@example.com"
ENV ADMIN_PASSWORD="change-me-please"
ENV ACCEPT_TERMS="true"
ENV PROJECT_OWNER="jimmy-the-cricket@gmail.com"

EXPOSE 8055

# Use custom startup script that runs migrations and schema apply
CMD ["/directus/start.sh"]
