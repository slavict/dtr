# Build from the official nginx:1.23-alpine image
FROM nginx:1.23-alpine
# Remove the default config
RUN rm /etc/nginx/conf.d/default.conf
# Copy our config
COPY ./nginx.conf /etc/nginx/conf.d/
