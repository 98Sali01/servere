FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
COPY server/package.json ./server/
RUN cd server && npm install --omit=dev
COPY server/index.js ./server/
COPY --from=frontend-build /app/dist ./dist
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server/index.js"]