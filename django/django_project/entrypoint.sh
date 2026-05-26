#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    # Wait until the database is ready
    echo "Waiting for PostgreSQL..."

    # Check host and port availability
    while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL is ready."
fi

# Run migrations
python manage.py migrate

exec "$@"
