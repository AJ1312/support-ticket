#!/bin/bash
set -e

echo "PostgreSQL is ready!"

echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate --noinput

echo "Starting Gunicorn..."
exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120
