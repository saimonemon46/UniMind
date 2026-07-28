#!/bin/sh
set -eu

until python manage.py migrate --noinput; do
  echo "Database is unavailable; retrying in 2 seconds..."
  sleep 2
done

exec python manage.py runserver 0.0.0.0:8000