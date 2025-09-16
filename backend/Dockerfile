FROM python:3.12-slim

WORKDIR /home/family/backend

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /home/family/backend

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

RUN pip install -U 'Twisted[tls,http2]'