FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api_server.py app.py simple_tryon.py ./
COPY leffa_utils/ ./leffa_utils/
# ckpts are mounted as a volume, no need to copy

ENV PYTHONUNBUFFERED=1
ENV PORT=9000

EXPOSE 9000

CMD ["python", "api_server.py"] 