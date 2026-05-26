Repository reference: https://habr.com/ru/post/713490/
React + Django + Postgres + RabbitMQ + Nginx in Docker.

Full documentation: see README.md

Quick start:
1) Clone repo, cd into project root
2) chmod +x django/django_project/entrypoint.sh
3) Create .env (see README.md "Environment variables")
4) docker-compose up -d
5) docker-compose exec django python manage.py migrate
