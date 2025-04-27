# ---------- Build Stage ----------
FROM node:18 AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# ---------- Production Stage ----------
FROM gcr.io/distroless/nodejs:18

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000

CMD ["app.js"]
