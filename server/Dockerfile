FROM node:22-alpine
WORKDIR /app
COPY server/package.json ./package.json
COPY server/server.mjs ./server.mjs
RUN mkdir -p /data && chown node:node /data
USER node
ENV NODE_ENV=production PORT=8080 SHARE_STORE_FILE=/data/shares.json
VOLUME ["/data"]
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 CMD wget -qO- http://127.0.0.1:8080/api/health || exit 1
CMD ["node", "server.mjs"]
