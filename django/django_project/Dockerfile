# Base image: Python 3.11 on Alpine (smaller footprint)
FROM python:3.11-alpine

# Working directory
WORKDIR /usr/src/app
# Directories for static and media files
RUN mkdir -p $WORKDIR/static
RUN mkdir -p $WORKDIR/media

# Python environment variables
# Do not write .pyc cache files
ENV PYTHONDONTWRITEBYTECODE 1
# Do not buffer stdout and stderr
ENV PYTHONUNBUFFERED 1

RUN apk update \
    && apk add postgresql-dev gcc python3-dev musl-dev

# Upgrade pip
RUN pip install --upgrade pip

# Copy and install dependencies. This layer is cached and only re-runs when
# requirements.txt changes.
COPY ./requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of the application
COPY . .

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
