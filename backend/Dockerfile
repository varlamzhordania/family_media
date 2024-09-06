FROM python:3.11

WORKDIR /home/family/backend

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update

COPY ./requirements.txt /home/family/backend

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

RUN pip install -U 'Twisted[tls,http2]'