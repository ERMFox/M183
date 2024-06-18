#!/bin/sh

# Set up SSL directory
SSL_DIR="/etc/nginx/ssl"
mkdir -p $SSL_DIR

# Generate self-signed certificate if it doesn't exist
if [ ! -f "$SSL_DIR/nginx.crt" ] || [ ! -f "$SSL_DIR/nginx.key" ]; then
    echo "Generating self-signed certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/nginx.key" \
        -out "$SSL_DIR/nginx.crt" \
        -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=localhost"
else
    echo "Using existing certificate..."
fi

# Start NGINX
exec nginx -g 'daemon off;'