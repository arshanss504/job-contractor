# Minimal multi-stage Dockerfile

FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci && npm cache clean --force
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc libpq-dev \
    && pip install --no-cache-dir -r backend/requirements.txt \
    && apt-get purge -y gcc libpq-dev && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*
COPY backend/ ./
COPY --from=frontend-build /app/dist ./static
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]