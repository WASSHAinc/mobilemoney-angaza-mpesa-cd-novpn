FROM --platform=linux/amd64 node:20 AS builder
WORKDIR /app
COPY ./package.json ./
RUN yarn 
RUN yarn global add @nestjs/cli
COPY . .
RUN yarn build

FROM --platform=linux/amd64 node:20-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/keys ./keys

EXPOSE 8080
CMD ["node", "dist/main"]
